/**
 * LDS Slides — deck channel.
 *
 * The one piece of machinery a presenter view needs that a layout cannot
 * provide: two views of the same deck agreeing on where the talk is. It
 * carries `{ index, step }` and nothing else — no rendering, no ownership of
 * what a slide means — so the design system stays a design system and the
 * app decides where each view lives.
 *
 * Two transports, because one is not enough. `BroadcastChannel` reaches other
 * documents on the origin (the presenter's second window) but deliberately
 * never delivers to the context that posted, so a presenter view and an
 * audience view rendered on the SAME page would never hear each other. A
 * module-level bus covers that case, which is also the only case a headless
 * assertion can observe.
 *
 * Joining ASKS rather than announces. A presenter window opened ten minutes
 * into a talk must land on the slide the room is looking at, and a view that
 * announced its own fresh state instead would drag everyone back to the
 * start. So a new view requests the position and adopts the answer; only
 * later moves are published.
 */
let nextId = 0;
const buses = new Map();

export function createDeckChannel(name) {
  if (!name || typeof window === 'undefined') return null;

  const id = `deck-${(nextId += 1)}`;
  let peers = buses.get(name);
  if (!peers) {
    peers = new Set();
    buses.set(name, peers);
  }
  const self = { id, receive: null, getState: null };
  peers.add(self);

  const remote = typeof BroadcastChannel === 'function'
    ? new BroadcastChannel(`lds-slides:${name}`)
    : null;
  if (remote) {
    remote.onmessage = (event) => {
      const message = event.data;
      if (!message || message.from === id) return;
      if (message.request) {
        const state = self.getState?.();
        if (state) remote.postMessage({ from: id, state });
        return;
      }
      if (message.state) self.receive?.(message.state);
    };
  }

  return {
    publish(state) {
      for (const peer of peers) {
        if (peer !== self) peer.receive?.(state);
      }
      remote?.postMessage({ from: id, state });
    },
    subscribe(receive, getState) {
      self.receive = receive;
      self.getState = getState;
    },
    request() {
      for (const peer of peers) {
        if (peer === self) continue;
        const state = peer.getState?.();
        if (state) {
          self.receive?.(state);
          return;
        }
      }
      remote?.postMessage({ from: id, request: true });
    },
    close() {
      peers.delete(self);
      if (peers.size === 0) buses.delete(name);
      remote?.close();
    },
  };
}

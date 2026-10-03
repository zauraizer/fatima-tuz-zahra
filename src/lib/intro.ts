/* The hero waits for the opening splash before animating in.
   Resolved by <Splash> once it's ~40% scrolled away (or straight away with
   reduced motion, or when the page loads already scrolled past it). */
let resolve!: () => void;
export const introFinished = new Promise<void>((r) => (resolve = r));
export const finishIntro = () => resolve();

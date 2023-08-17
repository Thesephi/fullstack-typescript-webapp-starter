import React, { StrictMode, Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ExampleReactComponent } from "shared/domains/ExampleReactComponent";

/**
 * @TODO add resources to preloadedState, like tutorial:
 *   - https://github.com/webpack/webpack-dev-middleware#server-side-rendering
 *   - https://codesandbox.io/s/kind-sammet-j56ro?file=/server/render.js:1126-1156
 * @TODO consider handling <head> like tutorial:
 *   - https://github.com/reactwg/react-18/discussions/106
 */
export const RootApp: React.FC<{ preloadedState: any }> = ({ preloadedState }) => {
  // @TODO remove this hack when this is ready: https://github.com/facebook/react/issues/24430#issuecomment-1440427646
  useEffect(() => {
    document.title = "My React SSR App"
  }, []);
  return <StrictMode>
  <html lang="en">
    <Suspense>
    <ErrorBoundary FallbackComponent={Error}>
    <head>
      {/* <meta charSet="utf-8" /> @TODO enable when this is ready: https://github.com/facebook/react/issues/24430#issuecomment-1440427646 */}
      {/* <meta name="viewport" content="width=device-width, initial-scale=1" /> @TODO enable when this is ready: https://github.com/facebook/react/issues/24430#issuecomment-1440427646 */}
      {/* <title>My React SSR App</title> @TODO enable when this is ready: https://github.com/facebook/react/issues/24430#issuecomment-1440427646 */}
      {/* TODO find a way to add these in dynamically, all while not triggering React hydration error during dev mode */}
      <link rel="stylesheet" href={"/css/main.css"} />
      <link rel="stylesheet" href={"/css/root.css"} />
    </head>
    <body>
      <ExampleReactComponent foo={preloadedState.foo} />
    </body>
    </ErrorBoundary>
    </Suspense>
  </html>
  </StrictMode>;
}

// export const withRootApp(Comp: React.ReactElement): React.ReactNode {
//   return <StrictMode>
//     <RootApp>
//       {Comp}
//     </RootApp>
//   </StrictMode>;
// }

function Error({ error }: { error: any }) {
  return (
    <div>
      <h1>Application Error</h1>
      <pre style={{whiteSpace: "pre-wrap"}}>{error.stack}</pre>
    </div>
  );
}
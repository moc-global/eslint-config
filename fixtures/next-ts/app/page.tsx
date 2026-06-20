// App Router page: exports `metadata` alongside the default component. This
// exercises the Next Fast Refresh export convention — `metadata` must NOT be
// flagged by react-refresh/only-export-components.
export const metadata = {
  title: 'Home',
};

export default function Page() {
  return <main>Home</main>;
}

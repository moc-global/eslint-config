// Pages Router page: exports `getServerSideProps` alongside the default
// component. Exercises the Pages Router Fast Refresh export name — it must NOT
// be flagged by react-refresh/only-export-components.
export async function getServerSideProps() {
  return { props: { now: 'today' } };
}

export default function Ssr({ now }: { now: string }) {
  return <main>{now}</main>;
}

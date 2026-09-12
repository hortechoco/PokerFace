export function StatusScreen({
  glyph,
  title,
  message,
}: {
  glyph: string;
  title: string;
  message?: string;
}) {
  return (
    <div className="status-screen">
      <div className="glyph" aria-hidden="true">
        {glyph}
      </div>
      <h1>{title}</h1>
      {message && <p>{message}</p>}
    </div>
  );
}

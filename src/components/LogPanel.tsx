type LogPanelProps = {
  logs: string[];
};

export function LogPanel({ logs }: LogPanelProps) {
  return (
    <section className="log-panel" aria-label="ターンログ">
      <h2>ログ</h2>
      <ol>
        {logs.slice(0, 20).map((log, index) => (
          <li key={`${log}-${index}`}>{log}</li>
        ))}
      </ol>
    </section>
  );
}

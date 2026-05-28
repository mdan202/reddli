export default function Toast({ icon, message, visible }) {
  return (
    <div className={`toast${visible ? ' show' : ''}`}>
      <span>{icon}</span>
      <span>{message}</span>
    </div>
  );
}

export default function SendingLoader({ isSending, tiny = false }) {
  if (!isSending) return null;

  return (
    <div className="flex items-center">
      <svg
        width={tiny ? "16" : "20"}
        height="8"
        viewBox="0 0 24 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="4" cy="4" r="2" fill="gray">
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="12" cy="4" r="2" fill="gray">
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur="1s"
            repeatCount="indefinite"
            begin="0.2s"
          />
        </circle>
        <circle cx="20" cy="4" r="2" fill="gray">
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur="1s"
            repeatCount="indefinite"
            begin="0.4s"
          />
        </circle>
      </svg>
    </div>
  );
}

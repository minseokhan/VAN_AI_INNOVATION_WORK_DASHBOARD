import { Avatar } from "./Avatar";

const MAX = 4;

export function AvatarGroup({ names }: { names: string[] }) {
  const shown = names.slice(0, MAX);
  const rest = names.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((name, i) => (
        <Avatar key={`${name}-${i}`} name={name} className={i > 0 ? "-ml-2 ring-2 ring-white" : undefined} />
      ))}
      {rest > 0 && (
        <span className="-ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-medium tabular-nums text-slate-600 ring-2 ring-white">
          +{rest}
        </span>
      )}
    </div>
  );
}

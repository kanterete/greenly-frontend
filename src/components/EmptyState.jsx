import { Leaf } from "lucide-react";

export default function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Leaf size={28} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

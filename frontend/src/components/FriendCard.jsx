import { Link } from "react-router";
import { TECH_STACK_TO_ICON } from "../constants";

const FriendCard = ({ friend }) => {
  const proficientTechs = Array.isArray(friend.proficientTechStack) ? friend.proficientTechStack : friend.proficientTechStack ? [friend.proficientTechStack] : [];
  const learningTechs = Array.isArray(friend.learningTechStack) ? friend.learningTechStack : friend.learningTechStack ? [friend.learningTechStack] : [];
  
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img src={friend.profilePic} alt={friend.fullName} />
          </div>
          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>

        <div className="space-y-2 mb-3">
          {/* Proficient Tech Stacks */}
          {proficientTechs.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs font-medium text-secondary">💻 Proficient:</span>
              {proficientTechs.slice(0, 3).map((tech) => (
                <span key={tech} className="badge badge-secondary badge-sm">
                  {getTechIcon(tech)}
                  {tech}
                </span>
              ))}
              {proficientTechs.length > 3 && (
                <span className="badge badge-secondary badge-sm">+{proficientTechs.length - 3}</span>
              )}
            </div>
          )}
          
          {/* Learning Tech Stacks */}
          {learningTechs.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs font-medium text-accent">📚 Learning:</span>
              {learningTechs.slice(0, 3).map((tech) => (
                <span key={tech} className="badge badge-outline badge-sm">
                  {getTechIcon(tech)}
                  {tech}
                </span>
              ))}
              {learningTechs.length > 3 && (
                <span className="badge badge-outline badge-sm">+{learningTechs.length - 3}</span>
              )}
            </div>
          )}
        </div>

        <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
          Message
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;

export function getTechIcon(techStack) {
  if (!techStack) return null;

  const techLower = techStack.toLowerCase();
  const icon = TECH_STACK_TO_ICON[techLower];

  if (icon) {
    return (
      <span className="mr-1 inline-block">
        {icon}
      </span>
    );
  }
  return <span className="mr-1 inline-block">💻</span>; // Default tech icon
}

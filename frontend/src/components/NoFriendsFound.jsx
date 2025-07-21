import { Link } from "react-router";
import { UserPlusIcon, Edit2Icon } from "lucide-react";
import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import EditProfileModal from "./EditProfileModal";

const NoFriendsFound = () => {
  const { authUser } = useAuthUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <div className="card bg-base-200 p-8 text-center">
        <div className="space-y-4">
          <div className="text-6xl">👥</div>
          <h3 className="font-semibold text-xl">No friends yet</h3>
          <p className="text-base-content opacity-70 max-w-md mx-auto">
            Start building your tech network by connecting with fellow developers and learners!
          </p>
          <div className="flex gap-2 justify-center">
            <Link to="/friends" className="btn btn-primary">
              <UserPlusIcon className="mr-2 size-4" />
              Find Tech Partners
            </Link>
            <button
              className="btn btn-secondary"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2Icon className="mr-2 size-4" />
              Update Profile
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={authUser}
      />
    </>
  );
};

export default NoFriendsFound;

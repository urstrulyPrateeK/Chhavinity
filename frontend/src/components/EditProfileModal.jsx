import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { LoaderIcon, X, Plus, Edit2Icon } from "lucide-react";
import { TECH_STACKS } from "../constants";

const EditProfileModal = ({ isOpen, onClose, user }) => {
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: "",
    bio: "",
    proficientTechStack: [],
    learningTechStack: [],
    location: "",
    profilePic: "",
  });

  // Update form state when user prop changes or modal opens
  useEffect(() => {
    if (user && isOpen) {
      console.log("Initializing form with user data:", user);
      setFormState({
        fullName: user.fullName || "",
        bio: user.bio || "",
        proficientTechStack: Array.isArray(user.proficientTechStack) ? [...user.proficientTechStack] : user.proficientTechStack ? [user.proficientTechStack] : [],
        learningTechStack: Array.isArray(user.learningTechStack) ? [...user.learningTechStack] : user.learningTechStack ? [user.learningTechStack] : [],
        location: user.location || "",
        profilePic: user.profilePic || "",
      });
      // Reset selection states
      setSelectedProficient("");
      setSelectedLearning("");
      setCustomProficient("");
      setCustomLearning("");
    }
  }, [user, isOpen]);

  const [selectedProficient, setSelectedProficient] = useState("");
  const [selectedLearning, setSelectedLearning] = useState("");
  const [customProficient, setCustomProficient] = useState("");
  const [customLearning, setCustomLearning] = useState("");

  const { mutate: updateProfileMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

    const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("Closing modal and resetting form state");
    // Reset all form state
    setFormState({
      fullName: "",
      bio: "",
      proficientTechStack: [],
      learningTechStack: [],
      location: "",
      profilePic: "",
    });
    setSelectedProficient("");
    setSelectedLearning("");
    setCustomProficient("");
    setCustomLearning("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", formState);
    
    // Validate that we have at least one tech stack in each category
    if (formState.proficientTechStack.length === 0) {
      toast.error("Please add at least one proficient tech stack");
      return;
    }
    
    if (formState.learningTechStack.length === 0) {
      toast.error("Please add at least one learning tech stack");
      return;
    }
    
    updateProfileMutation(formState);
  };

  const addProficientTech = () => {
    const tech = selectedProficient === "other" ? customProficient.trim() : selectedProficient;
    console.log("Adding proficient tech:", tech);
    console.log("Current proficient techs:", formState.proficientTechStack);
    
    if (tech && !formState.proficientTechStack.includes(tech.toLowerCase())) {
      const newTechStacks = [...formState.proficientTechStack, tech.toLowerCase()];
      console.log("New proficient tech stacks:", newTechStacks);
      
      setFormState({
        ...formState,
        proficientTechStack: newTechStacks
      });
      setSelectedProficient("");
      setCustomProficient("");
      toast.success(`Added ${tech} to proficient skills`);
    } else if (formState.proficientTechStack.includes(tech.toLowerCase())) {
      toast.error(`${tech} is already in your proficient skills`);
    }
  };

  const addLearningTech = () => {
    const tech = selectedLearning === "other" ? customLearning.trim() : selectedLearning;
    console.log("Adding learning tech:", tech);
    console.log("Current learning techs:", formState.learningTechStack);
    
    if (tech && !formState.learningTechStack.includes(tech.toLowerCase())) {
      const newTechStacks = [...formState.learningTechStack, tech.toLowerCase()];
      console.log("New learning tech stacks:", newTechStacks);
      
      setFormState({
        ...formState,
        learningTechStack: newTechStacks
      });
      setSelectedLearning("");
      setCustomLearning("");
      toast.success(`Added ${tech} to learning goals`);
    } else if (formState.learningTechStack.includes(tech.toLowerCase())) {
      toast.error(`${tech} is already in your learning goals`);
    }
  };

  const removeProficientTech = (techToRemove) => {
    console.log("Removing proficient tech:", techToRemove);
    const newTechStacks = formState.proficientTechStack.filter(tech => tech !== techToRemove);
    setFormState({
      ...formState,
      proficientTechStack: newTechStacks
    });
    toast.success(`Removed ${techToRemove} from proficient skills`);
  };

  const removeLearningTech = (techToRemove) => {
    console.log("Removing learning tech:", techToRemove);
    const newTechStacks = formState.learningTechStack.filter(tech => tech !== techToRemove);
    setFormState({
      ...formState,
      learningTechStack: newTechStacks
    });
    toast.success(`Removed ${techToRemove} from learning goals`);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={handleBackdropClick}
      ></div>
      
      {/* Modal */}
      <div 
        className="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto z-[10000] relative"
        onClick={handleModalContentClick}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-2xl flex items-center gap-2">
            <Edit2Icon className="size-6 text-primary" />
            Edit Profile
          </h3>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle"
            onClick={handleClose}
            disabled={isPending}
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* FULL NAME */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Full Name</span>
            </label>
            <input
              type="text"
              value={formState.fullName}
              onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
              className="input input-bordered w-full"
              placeholder="Your full name"
              required
            />
          </div>

          {/* BIO */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Bio</span>
            </label>
            <textarea
              value={formState.bio}
              onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
              className="textarea textarea-bordered h-24"
              placeholder="Tell others about yourself and your development journey"
              required
            />
          </div>

          {/* TECH STACKS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PROFICIENT TECH STACK */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Proficient Tech Stacks</span>
              </label>
              
              {/* Selected Tech Stacks */}
              <div className="flex flex-wrap gap-2 mb-3 min-h-[60px] p-3 border border-base-300 rounded-lg bg-base-100">
                {formState.proficientTechStack.length === 0 ? (
                  <span className="text-sm text-base-content/60 italic">No tech stacks selected</span>
                ) : (
                  formState.proficientTechStack.map((tech) => (
                    <div key={tech} className="badge badge-secondary gap-2">
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeProficientTech(tech)}
                        className="btn btn-ghost btn-xs size-4 p-0 hover:bg-error hover:text-error-content"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Tech Stack */}
              <div className="flex gap-2">
                <select
                  value={selectedProficient}
                  onChange={(e) => setSelectedProficient(e.target.value)}
                  className="select select-bordered flex-1"
                >
                  <option value="">Select a tech stack</option>
                  {TECH_STACKS.filter(tech => !formState.proficientTechStack.includes(tech.toLowerCase()))
                    .map((tech) => (
                      <option key={tech} value={tech.toLowerCase()}>
                        {tech}
                      </option>
                    ))}
                  <option value="other">Other (custom)</option>
                </select>
                {selectedProficient === "other" && (
                  <input
                    type="text"
                    placeholder="Enter custom tech"
                    className="input input-bordered flex-1"
                    value={customProficient}
                    onChange={(e) => setCustomProficient(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addProficientTech()}
                  />
                )}
                <button
                  type="button"
                  onClick={addProficientTech}
                  className="btn btn-primary"
                  disabled={!selectedProficient || (selectedProficient === "other" && !customProficient.trim())}
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            {/* LEARNING TECH STACK */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Learning Tech Stacks</span>
              </label>
              
              {/* Selected Tech Stacks */}
              <div className="flex flex-wrap gap-2 mb-3 min-h-[60px] p-3 border border-base-300 rounded-lg bg-base-100">
                {formState.learningTechStack.length === 0 ? (
                  <span className="text-sm text-base-content/60 italic">No tech stacks selected</span>
                ) : (
                  formState.learningTechStack.map((tech) => (
                    <div key={tech} className="badge badge-outline gap-2">
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeLearningTech(tech)}
                        className="btn btn-ghost btn-xs size-4 p-0 hover:bg-error hover:text-error-content"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Tech Stack */}
              <div className="flex gap-2">
                <select
                  value={selectedLearning}
                  onChange={(e) => setSelectedLearning(e.target.value)}
                  className="select select-bordered flex-1"
                >
                  <option value="">Select a tech stack</option>
                  {TECH_STACKS.filter(tech => !formState.learningTechStack.includes(tech.toLowerCase()))
                    .map((tech) => (
                      <option key={tech} value={tech.toLowerCase()}>
                        {tech}
                      </option>
                    ))}
                  <option value="other">Other (custom)</option>
                </select>
                {selectedLearning === "other" && (
                  <input
                    type="text"
                    placeholder="Enter custom tech"
                    className="input input-bordered flex-1"
                    value={customLearning}
                    onChange={(e) => setCustomLearning(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addLearningTech()}
                  />
                )}
                <button
                  type="button"
                  onClick={addLearningTech}
                  className="btn btn-primary"
                  disabled={!selectedLearning || (selectedLearning === "other" && !customLearning.trim())}
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* LOCATION */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Location</span>
            </label>
            <input
              type="text"
              value={formState.location}
              onChange={(e) => setFormState({ ...formState, location: e.target.value })}
              className="input input-bordered w-full"
              placeholder="City, Country"
              required
            />
          </div>

          {/* BUTTONS */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <LoaderIcon className="animate-spin size-4 mr-2" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditProfileModal;

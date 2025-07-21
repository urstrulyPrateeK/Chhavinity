import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { CameraIcon, LoaderIcon, MapPinIcon, Sparkles, ShuffleIcon, X, Plus } from "lucide-react";
import { TECH_STACKS } from "../constants";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    proficientTechStack: Array.isArray(authUser?.proficientTechStack) ? authUser.proficientTechStack : authUser?.proficientTechStack ? [authUser.proficientTechStack] : [],
    learningTechStack: Array.isArray(authUser?.learningTechStack) ? authUser.learningTechStack : authUser?.learningTechStack ? [authUser.learningTechStack] : [],
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

  const [selectedProficient, setSelectedProficient] = useState("");
  const [selectedLearning, setSelectedLearning] = useState("");
  const [customProficient, setCustomProficient] = useState("");
  const [customLearning, setCustomLearning] = useState("");

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Random profile picture generated!");
  };

  const addProficientTech = () => {
    const tech = selectedProficient === "other" ? customProficient.trim() : selectedProficient;
    if (tech && !formState.proficientTechStack.includes(tech.toLowerCase())) {
      setFormState({
        ...formState,
        proficientTechStack: [...formState.proficientTechStack, tech.toLowerCase()]
      });
      setSelectedProficient("");
      setCustomProficient("");
    }
  };

  const addLearningTech = () => {
    const tech = selectedLearning === "other" ? customLearning.trim() : selectedLearning;
    if (tech && !formState.learningTechStack.includes(tech.toLowerCase())) {
      setFormState({
        ...formState,
        learningTechStack: [...formState.learningTechStack, tech.toLowerCase()]
      });
      setSelectedLearning("");
      setCustomLearning("");
    }
  };

  const removeProficientTech = (techToRemove) => {
    setFormState({
      ...formState,
      proficientTechStack: formState.proficientTechStack.filter(tech => tech !== techToRemove)
    });
  };

  const removeLearningTech = (techToRemove) => {
    setFormState({
      ...formState,
      learningTechStack: formState.learningTechStack.filter(tech => tech !== techToRemove)
    });
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Complete Your Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                {formState.profilePic ? (
                  <img
                    src={formState.profilePic}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>

              {/* Generate Random Avatar BTN */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleRandomAvatar} className="btn btn-accent">
                  <ShuffleIcon className="size-4 mr-2" />
                  Generate Random Avatar
                </button>
              </div>
            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Your full name"
              />
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                className="textarea textarea-bordered h-24"
                placeholder="Tell others about yourself and your development journey"
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
                <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2 border border-base-300 rounded-lg bg-base-100">
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
                <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2 border border-base-300 rounded-lg bg-base-100">
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
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  name="location"
                  value={formState.location}
                  onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                  className="input input-bordered w-full pl-10"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}

            <button className="btn btn-primary w-full" disabled={isPending} type="submit">
              {!isPending ? (
                <>
                  <Sparkles className="size-5 mr-2" />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Onboarding...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default OnboardingPage;
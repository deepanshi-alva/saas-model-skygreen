"use client";
import { Plus, MessageCircle, ClipboardEdit, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@headlessui/react";
import { useAppSelector } from "./Store";
import axios from "axios";

const FloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact_number: "",
    query: "",
    related_media: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useAppSelector((state) => state.user);

  const allMenuItems = [
    {
      text: "Report Issue / Query",
      action: "openForm",
      roles: ["SUPER_ADMIN", "SALES_ADMIN", "SALES_TEAM_LEADER"],
      icon: <ClipboardEdit size={18} />,
    },
    {
      text: "Urgent Help (WhatsApp)",
      action: "openWhatsApp",
      roles: ["SUPER_ADMIN", "SALES_ADMIN", "SALES_TEAM_LEADER"],
      icon: <MessageCircle size={18} />,
    },
  ];

  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(user?.role?.name)
  );

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".floatingButtonWrap")) setIsOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.8 },
    visible: { y: 0, opacity: 1, scale: 1 },
    exit: { y: 50, opacity: 0, scale: 0.8 },
  };

  // 🟢 WhatsApp Handler
  const handleWhatsApp = () => {
    const phoneNumber = "919667796078"; // Developer number
    const message = `Hello Developer, I have an urgent issue.\n\nUser: ${user?.username}\nRole: ${user?.role?.name}\nEmail: ${user?.email}`;
    const link = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(link, "_blank");
    setIsOpen(false);
  };

  const handleMenuClick = (action) => {
    if (action === "openWhatsApp") handleWhatsApp();
    if (action === "openForm") setIsFormOpen(true);
  };

  // 🧾 Submit Query to Strapi
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const form = new FormData();
      form.append("data", JSON.stringify({
        name: user?.username,
        role: user?.role?.name,
        contact_number: formData.contact_number,
        query: formData.query,
      }));

      if (formData.related_media) {
        form.append("files.related_media", formData.related_media);
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/queries-developers`,
        form,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
          }

        }
      );

      alert("✅ Your query has been submitted successfully!");
      setIsFormOpen(false);
      setFormData({ name: "", contact_number: "", query: "", related_media: null });
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit query. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed z-[999] floatingButtonWrap bg-primary rounded-full"
      style={{ bottom: "110px", right: "35px" }}
    >
      <div className="relative">
        {/* Animated Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={containerVariants}
              className="absolute right-0 rounded-lg p-2"
              style={{ bottom: "65px" }}
            >
              {menuItems.map((item, index) => (
                <motion.li key={index} variants={itemVariants} className="my-1">
                  <button
                    onClick={() => handleMenuClick(item.action)}
                    className="flex items-center justify-center gap-2 bg-orange-500 text-white rounded-full text-sm font-semibold px-4 py-2 whitespace-nowrap border-2 border-orange-700 hover:translate-x-2 transition-transform duration-300"
                  >
                    {item.icon}
                    {item.text}
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        {/* Floating FAB */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`w-14 h-14 flex items-center justify-center bg-sky-500 text-white rounded-full border-4 border-gray-300 shadow-lg transition-all duration-300 transform ${isOpen ? "rotate-180" : "rotate-0"
            }`}
          onClick={toggleMenu}
        >
          <Plus size={30} />
        </motion.button>
      </div>

      {/* 📋 Query Form Modal */}
      <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)} className="relative z-[1000]">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

        {/* Centered Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-200"
          >
            <Dialog.Title className="text-lg font-semibold mb-4 text-gray-800 text-center">
              Report an Issue / Query
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Contact Number"
                value={formData.contact_number}
                onChange={(e) =>
                  setFormData({ ...formData, contact_number: e.target.value })
                }
                required
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              />

              <textarea
                placeholder="Describe your issue..."
                rows={4}
                value={formData.query}
                onChange={(e) =>
                  setFormData({ ...formData, query: e.target.value })
                }
                required
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none resize-none"
              />

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 font-medium mb-1">
                  <Upload size={16} /> Attach Media (optional)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      related_media: e.target.files[0],
                    })
                  }
                  className="text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm rounded-md text-white bg-green-600 hover:bg-green-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      </Dialog>

    </div>
  );
};

export default FloatingButton;

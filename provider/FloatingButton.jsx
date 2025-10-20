import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "./Store";

const FloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAppSelector((state) => state.user);

  // Define menu items
  const allMenuItems = [
    { text: "Add Courses", route: "/admin/course/new/1", roles: ["ADMIN", "MANAGER"] },
    { text: "Add Assignment", route: "/admin/assignment/new#1", roles: ["ADMIN", "MANAGER"] },
    { text: "Add Course Proposals", route: "/public/course-proposals?isFab=true", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) => item.roles.includes(user?.role?.name));

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".floatingButtonWrap")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 50,
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    exit: {
      y: 50,
      opacity: 0,
      scale: 0.8,
      transition: {
        type: "tween",
      },
    },
  };

  return (
    <div
      className="fixed z-[999] floatingButtonWrap bg-primary rounded-full"
      style={{ bottom: "110px", right: "35px" }}
    >
      <div className="relative">
        {/* Animated Menu with Staggered Entrance/Exit */}
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
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="my-1" // Reduced margin for better alignment
                >
                  <Link
                    href={item.route}
                    className="block bg-orange-500 text-white text-center rounded-full border-2 border-indigo-600 text-sm font-semibold px-4 py-2 whitespace-nowrap hover:translate-x-2 transition-transform duration-300"
                  >
                    {item.text}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        {/* Floating Button with Rotation */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`w-14 h-14 flex items-center justify-center bg-sky-500 text-white rounded-full border-4 border-gray-300 shadow-lg transition-all duration-300 transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          onClick={toggleMenu}
        >
          {<Plus size={30} />}
        </motion.button>
      </div>
    </div>
  );
};

export default FloatingButton;

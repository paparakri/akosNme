type AnimationType = "fadeIn" | "wiper";

export const animationVariants = {
    fadeIn: {
        container: {
            hidden: { opacity: 0 },
            visible: (i: number = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: i * 0.3 },
            }),
        },
        child: {
            visible: {
            opacity: 1,
            y: [0, -10, 0],
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
            },
            hidden: { opacity: 0, y: 10 },
        },
        },
        wiper: {
        container: {
            hidden: {},
            visible: {},
        },
        child: {
            hidden: {
            clipPath: "inset(0% 100% 0% 0%)",
            },
            visible: {
            clipPath: "inset(0% 0% 0% 0%)",
            transition: {
                duration: 0.9,
                ease: [0.65, 0, 0.75, 1], // Swift Beginning, Prolonged Ease, Quick Finish
            },
            },
        },
    },
};
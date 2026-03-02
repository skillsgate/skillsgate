import { useEffect, useRef } from "react";

export function useReveal() {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add("visible");
						observer.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
		);

		const elements = el.querySelectorAll(".reveal");
		elements.forEach((e) => observer.observe(e));

		return () => observer.disconnect();
	}, []);

	return ref;
}

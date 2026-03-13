import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

function CourseDetail() {
	const { id } = useParams();
	const [course, setCourse] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		setLoading(true);
		setError("");

		API.get(`courses/${id}/`)
			.then((res) => {
				setCourse(res.data);
			})
			.catch(() => {
				setError("Failed to load course details.");
			})
			.finally(() => {
				setLoading(false);
			});
	}, [id]);

	if (loading) return <p>Loading course...</p>;
	if (error) return <p>{error}</p>;
	if (!course) return <p>Course not found.</p>;

	return (
		<div>
			<h1>{course.title}</h1>
			<p>{course.description}</p>
		</div>
	);
}

export default CourseDetail;

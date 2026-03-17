import { useEffect, useState } from "react";
import API, { getApiErrorMessage } from "../api/api";
import CourseCard from "../components/CourseCard";

function Courses() {

  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");

    API.get("courses/")
      .then(res => setCourses(res.data.results || res.data))
      .catch((err) => {
        setCourses([]);
        setError(getApiErrorMessage(err));
      });
  }, []);

  if (error) {
    return (
      <div>
        <h1>All Courses</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>

      <h1>All Courses</h1>

      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}

    </div>
  );
}

export default Courses;
import { Link } from "react-router-dom";

function CourseCard({ course }) {
  return (
    <div style={{
      border: "1px solid #ddd",
      padding: "15px",
      margin: "10px",
      borderRadius: "8px"
    }}>
      <h3>{course.title}</h3>
      <p>{course.description}</p>

      <Link to={`/courses/${course.id}`}>
        View Course
      </Link>
    </div>
  );
}

export default CourseCard;
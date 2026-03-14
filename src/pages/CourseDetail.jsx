import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API, { getApiErrorMessage } from "../api/api";

function CourseDetail() {

  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");

    API.get(`courses/${id}/`)
      .then(res => setCourse(res.data))
      .catch((err) => {
        setCourse(null);
        setError(getApiErrorMessage(err));
      });
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!course) return <p>Loading...</p>;

  return (
    <div>

      <h1>{course.title}</h1>
      <p>{course.description}</p>

      <h3>Modules</h3>

      {course.modules?.map(module => (
        <div key={module.id}>
          <h4>{module.title}</h4>

          {module.lessons?.map(lesson => (
            <p key={lesson.id}>{lesson.title}</p>
          ))}

        </div>
      ))}

    </div>
  );
}

export default CourseDetail;
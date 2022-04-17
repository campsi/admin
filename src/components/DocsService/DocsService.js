import { Route, Routes, useParams } from "react-router-dom";
import ResourceListing from "./ResourceListing";
import ResourceForm from "./ResourceForm";

function DocsService(props) {
  useParams();
  return (
    <Routes>
      <Route
        path="resources/:resourceName/:id"
        element={<ResourceForm service={props.service} />}
      />
      <Route
        path="resources/:resourceName"
        element={<ResourceListing service={props.service} />}
      />
    </Routes>
  );
}

export default DocsService;

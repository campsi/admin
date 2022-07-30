import { Route, Routes, useParams } from "react-router-dom";
import ResourceListing from "./ResourceListing";
import ResourceForm from "./ResourceForm";
import DetectionStrategy from "../DetectionStrategy/DetectionStrategy";
import MatchString from "../MatchString/MatchString";
import LocalizedText from "../LocalizedText/LocalizedText";
import Asset from "../Asset/Asset";
import ClearbitSync from "../ClearbitSync/ClearbitSync";
import JsonTextArea from "../JsonTextArea/JsonTextArea";

function DocsService(props) {
  useParams();
  return (
    <Routes>
      <Route
        path="resources/:resourceName/:id"
        element={<ResourceForm service={props.service} customWidgets={{
          'DetectionStrategy': DetectionStrategy,
          'LocalizedString': LocalizedText,
          'MatchString': MatchString,
          'Asset': Asset,
          'ClearbitSync': ClearbitSync,
          'JsonTextArea': JsonTextArea
        }} />}
      />
      <Route
        path="resources/:resourceName"
        element={<ResourceListing service={props.service} />}
      />
    </Routes>
  );
}

export default DocsService;

import { Route, Routes, useParams } from 'react-router-dom';
import NotificationListing from './NotificationListing';
import NotificationForm from './NotificationForm';

function NotificationsService(props) {
  useParams();
  return (
    <Routes>
      <Route path="/:id" element={<NotificationForm service={props.service} />} />
      <Route path="/" element={<NotificationListing service={props.service} />} />
    </Routes>
  );
}

export default NotificationsService;

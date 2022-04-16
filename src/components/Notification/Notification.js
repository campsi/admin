import styled from "styled-components";

const NotificationStyle = styled.div`
  border-radius: 6px;
  box-shadow: 0 3px 30px rgba(0, 0, 0, 0.1);
  background: white;
  padding: 5px 10px;
  margin: 10px;
`;
function Notification(props) {
  return <NotificationStyle>
    <h3>{props.title}</h3>
    <h3>{props.message}</h3>
  </NotificationStyle>;
}

export default Notification

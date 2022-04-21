import {useParams} from "react-router-dom";
import PropTypes from 'prop-types';
function withParams(Component){
  function WrappedComponent(props){
    const params = useParams();
    return <Component {...props} params={params} />
  }
  WrappedComponent.displayName = `withParams(${Component.name})`
  return WrappedComponent;
}

withParams.propTypes = {
  params: PropTypes.objectOf(PropTypes.string)
}

export default withParams;

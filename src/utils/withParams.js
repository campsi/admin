import {useParams} from "react-router-dom";

function withParams(Component){
  function WrappedComponent(props){
    const params = useParams();
    return <Component {...props} params={params} />
  }
  WrappedComponent.displayName = `withParams(${Component.name})`
  return WrappedComponent;
}

export default withParams;

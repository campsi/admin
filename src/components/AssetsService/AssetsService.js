import { Component } from 'react';
import { withAppContext } from '../../App';
import { Typography } from 'antd';

const { Title } = Typography;

class AssetsService extends Component {
  state = {
    fileList: [],
    isFetching: false,
    isUploading: false,
    noListing: false
  };

  componentDidMount() {
    this.fetchAssets();
  }

  setStateAsync(state) {
    return new Promise(resolve => this.setState(state, () => resolve()));
  }

  async fetchAssets() {
    const { api, service } = this.props;
    await this.setStateAsync({ isFetching: true });
    try {
      const response = await api.client.get(`${service.name}`);
      await this.setStateAsync({ isFetching: false, fileList: response.data });
    } catch (err) {
      await this.setStateAsync({ isFetching: false, noListing: true });
    }
  }

  render() {
    return (
      <div>
        <Title>Asset service</Title>
      </div>
    );
  }
}

export default withAppContext(AssetsService);

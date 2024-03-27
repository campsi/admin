import { Descriptions, Table } from 'antd';
import { Component } from 'react';

class ShowcaseDetails extends Component {
  state = {
    dataSource: []
  };

  componentDidMount() {
    this.updateStateFromProps();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.result !== this.props.result) {
      this.updateStateFromProps();
    }
  }

  updateStateFromProps() {
    this.setState({
      dataSource: (this.props.result.media || []).map(output => {
        return { key: output.name, ...output };
      })
    });
  }

  getColumns = () => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Viewport',
      dataIndex: 'viewport',
      key: 'viewport',
      render: item => (
        <span>
          {item['width']} &times; {item['height']} px
        </span>
      )
    },

    {
      title: 'Public Url',
      dataIndex: 'url',
      key: 'url',
      render: item => {
        if (Array.isArray(item)) {
          return (
            <ul>
              {item.map(url => (
                <li>
                  <a href={url}>
                    <img src={url} width={300} alt="showcase render" />
                  </a>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <a href={item}>
            <img src={item} width={300} alt="showcase render" />
          </a>
        );
      }
    }
  ];

  render() {
    const { dataSource } = this.state;
    return (
      <>
        <Descriptions bordered column={3} size="large"></Descriptions>
        <Table columns={this.getColumns()} dataSource={dataSource} />
      </>
    );
  }
}

export default ShowcaseDetails;

import { Table } from "antd";
import { Component } from "react";

class ShowcaseDetails extends Component {
  state = {
    dataSource: this.props.result.map((output) => {
      return { key: output.name, ...output };
    }),
  };
  getColumns = () => [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Viewport",
      dataIndex: "viewport",
      key: "viewport",
      render: (item) => {
        return "Height: " + item["height"] + ", Width: " + item["width"];
      },
    },

    {
      title: "Public Url",
      dataIndex: "url",
      key: "url",
    },
  ];

  render() {
    const { dataSource } = this.state;
    return <Table columns={this.getColumns()} dataSource={dataSource} />;
  }
}

export default ShowcaseDetails;

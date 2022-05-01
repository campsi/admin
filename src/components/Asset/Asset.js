import React, { Component } from "react";
import { withAppContext } from "../../App";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Modal,
  Progress,
  Row,
  Select, Space,
} from "antd";
import {
  DeleteOutlined,
  FileImageOutlined, InfoCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
const { Item } = Descriptions;
class Asset extends Component {
  assetsServices = this.getAssetsServices();
  uploadFormRef = React.createRef();

  state = {
    uploadModalVisible: false,
    isUploading: false,
    detailsVisible: false,
    currentAssetsService: this.assetsServices[0],
  };

  setStateAsync(state) {
    return new Promise((resolve) => this.setState(state, () => resolve()));
  }

  render() {
    const { formData } = this.props;
    const {
      uploadModalVisible,
      isUploading,
      uploadProgress,
      currentAssetsService,
      detailsVisible
    } = this.state;

    return (
      <>
        <Col>
          <Row>
            <Card
              style={{ width: "100%" }}
              bodyStyle={{
                padding: 0,
              }}
              size="small"
              title={
                <>
                  <FileImageOutlined />{" "}
                  {this.props.schema.title || this.props.name}
                </>
              }
              extra={
                <Space>
                  <Select
                    options={this.getAssetsServices()}
                    value={currentAssetsService.name}
                    style={{ width: "auto" }}
                  />
                  {formData.url ? (
                    <><Button
                      onClick={() => this.eraseAsset()}
                      icon={<DeleteOutlined />}
                    >
                      Delete
                    </Button>
                      <Button
                        onClick={() => this.setState({detailsVisible: !detailsVisible})}
                        icon={<InfoCircleOutlined />}
                      >
                        Toggle details
                      </Button>
                    </>
                  ) : null}
                  <Button
                    icon={<UploadOutlined />}
                    onClick={() => {
                      this.setState({ uploadModalVisible: true });
                    }}
                  >
                    Upload
                  </Button>
                </Space>
              }
            >
              {formData.url && (
                <Descriptions column={2} bordered size="small">
                  {formData.detectedMimeType.indexOf("image" === 0) && (
                    <Item label="Preview" span={2}>
                      <img
                        src={formData.url}
                        style={{ maxWidth: 300, maxHeight: 250 }}
                        alt="asset"
                      />
                    </Item>
                  )}
                  {detailsVisible && (
                    <>
                  <Item label="URL" span={2}>
                    <a href={formData.url}>{formData.url}</a>
                  </Item>
                  <Item label="Original Name" span={2}>
                    {formData.originalName}
                  </Item>
                  <Item label="Created By">{formData.createdBy}</Item>
                  <Item label="Created At">
                    {new Date(formData.createdAt).toLocaleString()}
                  </Item>
                  <Item label="Detected Mime Type">
                    {formData.detectedMimeType}
                  </Item>
                  <Item label="Client reported Mime Type">
                    {formData.clientReportedMimeType}
                  </Item></>)}
                </Descriptions>
              )}
            </Card>
          </Row>
        </Col>
        <Modal
          visible={uploadModalVisible}
          onCancel={() => {
            this.setState({ uploadModalVisible: false });
          }}
          onOk={async () => {
            await this.uploadAsset(this.uploadFormRef.current);
          }}
        >
          <form
            ref={this.uploadFormRef}
            onSubmit={(event) => event.preventDefault()}
          >
            <div>
              <input type="file" name="file" />
            </div>
            {isUploading && (
              <div>
                <Progress percent={uploadProgress} />
              </div>
            )}
          </form>
        </Modal>
      </>
    );
  }

  eraseAsset() {
    this.props.onChange({});
  }

  async uploadAsset(form) {
    const { api } = this.props;
    const { currentAssetsService } = this.state;
    await this.setStateAsync({ isUploading: true });

    const response = await api.client.post(
      `${currentAssetsService.name}`,
      new FormData(form),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 10 * 60 * 1000,
        onUploadProgress: (event) => {
          this.setState({ uploadProgress: (event.loaded / event.total) * 100 });
        },
      }
    );

    await this.setStateAsync({
      isUploading: false,
      uploadModalVisible: false,
      uploadProgress: 0,
    });
    this.props.onChange(response.data[0]);
  }

  getAssetsServices() {
    const { services } = this.props;
    return Object.keys(services)
      .filter((serviceName) => {
        return services[serviceName].class === "AssetsService";
      })
      .map((serviceName) => {
        return {
          name: serviceName,
          key: serviceName,
          value: serviceName,
          label: services[serviceName].title,
          ...services[serviceName],
        };
      });
  }
}
export default withAppContext(Asset);

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, List, Upload, Input, Progress, Badge, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import { generateRelationField } from '../RelationField/RelationField';

/**
 * Cooldown duration before creating subsequent jobs
 * @type {number}
 */
const COOLDOWN = 100;

async function sleep(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

export default function BulkJobCreationForm({ api, services, form, setBulkButton }) {
  const [jobTemplate, setJobTemplate] = useState({});
  const [tasks, setTasks] = useState([]);

  const tasksState = JSON.stringify(tasks);

  useEffect(() => {
    /**
     * This method will call the API to create a job using the select jobTemplate
     * and the variables passed in the CSV string or file.
     *
     * @param {object} task
     * @param {number} index
     * @returns {Promise<void>}
     */
    async function createJob({ task, index }) {
      let status = 'default';
      let error;
      try {
        await api.client.post(`/automator/jobs/${task.payload.jobTemplateId}`, task.payload);
        status = 'success';
      } catch (err) {
        status = 'error';
        error = err;
      }
      await sleep(COOLDOWN);
      if (tasks.length === 0) {
        // tasks have been cleared, we don't want to regenerate the tasks list.
        return;
      }
      setTasks(
        tasks.map((taskItem, taskIndex) => {
          return taskIndex === index ? { ...taskItem, status, error } : taskItem;
        })
      );
    }

    // Each time the tasks array gets modified, we
    // Get the first pending task from the tasks array
    // and call the createJob
    const pending = tasks.reduce((prev, task, index) => {
      return task.status === 'default' && !prev ? { task, index } : prev;
    }, null);

    if (pending) {
      createJob(pending).then(result => {
        console.info('Created job', { result });
      });
    } else {
      setBulkButton(false);
    }
  }, [tasksState, tasks, api.client, setBulkButton]);

  /**
   * RelationField that points to the templates/jobs resource.
   * @type {React.Component}
   */
  const JobTemplateField = useMemo(
    () =>
      generateRelationField({
        resource: 'automator-job-template',
        service: 'templates',
        labelIndex: 'title'
      }),
    []
  );

  /**
   * Takes a CSV row, and transform it into a task object used to
   * update the component state (progress, errors, etc.)
   * @param {string[]} row
   * @param {string[]} tags
   * @returns {{payload: {variables: {}, jobTemplateId}, status: string}}
   */
  function createTask(row, tags) {
    return {
      status: 'default',
      payload: {
        jobTemplateId: jobTemplate.id,
        tags,
        variables: jobTemplate.data.variables.reduce((variablesMap, variable, index) => {
          return {
            ...variablesMap,
            [variable.technicalName]: row[index]
          };
        }, {})
      }
    };
  }

  function handleFinish(formData) {
    if (!jobTemplate) {
      return false;
    }

    const csv = formData.csvFile?.file ? formData.csvFile.file : formData.csvString;

    if (!csv) {
      return false;
    }

    Papa.parse(csv, {
      complete: result => setTasks(result.data.map(row => createTask(row, formData.tags)))
    });
  }

  if (tasks.length > 0) {
    return (
      <div>
        <List
          header={
            <Progress percent={Math.round((tasks.filter(task => task.status === 'success').length / tasks.length) * 100)} />
          }
          bordered
          size="small"
          dataSource={tasks}
          style={{ marginBottom: 16 }}
          pagination={{
            pageSize: 10
          }}
          renderItem={(task, index) => (
            <List.Item>
              <Badge count={index + 1} status={task.status} />
              <Input.TextArea
                rows={2}
                style={{
                  width: '100%',
                  fontSize: 12,
                  fontFamily: 'monospace'
                }}
                value={JSON.stringify(task.payload.variables)}
              />
            </List.Item>
          )}
        />
        <Button onClick={() => setTasks([])}>Clear tasks</Button>
      </div>
    );
  }
  return (
    <>
      <Form form={form} onFinish={handleFinish}>
        <Form.Item name="tags" label="Tags">
          <Select mode="tags" />
        </Form.Item>
        <JobTemplateField
          api={api}
          formData={jobTemplate.id}
          onChange={(id, jobTemplate) => setJobTemplate(jobTemplate)}
          services={services}
          schema={{
            title: 'Job template'
          }}
          formItemProps={{
            rules: [{ required: true, message: 'A job template is required' }],
            required: true,
            validateStatus: jobTemplate.id ? 'success' : 'error'
          }}
        />
        {jobTemplate.data && (
          <List
            style={{ marginBottom: 16 }}
            size="small"
            bordered
            header={<b>The selected job template requires the following variables</b>}
            dataSource={jobTemplate.data.variables}
            renderItem={variable => (
              <List.Item>
                <label>{variable.title}</label>&nbsp;
                <code>{variable.technicalName}</code>
              </List.Item>
            )}
          />
        )}
        <Form.Item label="Data" name="csvString">
          <Input.TextArea style={{ fontFamily: 'monospace' }} />
        </Form.Item>
        <Form.Item label="CSV" name="csvFile">
          <Upload
            maxCount={1}
            accept="text/csv"
            beforeUpload={() => {
              return false;
            }}
          >
            <Button icon={<UploadOutlined />}>Load a CSV file</Button>
          </Upload>
        </Form.Item>
      </Form>
    </>
  );
}

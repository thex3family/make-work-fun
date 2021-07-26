import Link from 'next/link';
//import Button from '@/components/ui/Button';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabase-client';
import { useUser } from '@/utils/useUser';
import { useRouter } from 'next/router';
import BottomNavbar from '@/components/ui/BottomNavbar/BottomNavbar';
import { Table, Input, Button, Popconfirm, Form } from 'antd';
import 'antd/dist/antd.css';

import { IconPicker } from 'react-fa-icon-picker';

const EditableContext = React.createContext(null);

function generateTable(
  dataSource,
  columns,
  EditableRowFunc,
  EditableCellFunc,
  handleAddFunc,
  handleSaveFunc
) {
  //console.log("Datasource: ", dataSource);
  //console.log("Columns: ", columns);

  const components = {
    body: {
      row: EditableRowFunc,
      cell: EditableCellFunc
    }
  };

  const cols = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSaveFunc
      })
    };
  });

  return (
    <div className="text-right">
      <Button
        className="rounded"
        onClick={handleAddFunc}
        style={{
          marginBottom: 16
        }}
      >
        Add Habit
      </Button>
      {/* <Button
        className="rounded"
        onClick={handleSaveFunc}
        type="primary"
        style={{
          marginBottom: 16
        }}
      >
        Save
      </Button> */}
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={cols}
      />
    </div>
  );
}

function EditableRow({ index, ...props }) {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
}

function EditableCell({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    console.log('record: ', record);
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex]
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      console.log('save - values: ', values);
      if (values.is_active) {
        handleSave({ ...record, is_active: values.is_active === 'true' });
      } else {
        handleSave({ ...record, ...values });
      }
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`
          }
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
}

export default function edit() {
  const [habits, setHabits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [icon, setIcon] = useState('');
  const {
    userLoaded,
    user,
    session,
    userDetails,
    userOnboarding,
    subscription
  } = useUser();

  const columns = [
    {
      title: 'Icon',
      dataIndex: 'icon',
      width: '10%',
      render: (_, record) => (
        <IconPicker value={icon} onChange={(v) => setIcon(v)} />
      )
    },
    {
      title: 'Habit',
      dataIndex: 'name',
      width: '15%',
      editable: true
    },
    {
      title: 'Group',
      dataIndex: 'group',
      width: '35%',
      editable: true
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: '35%',
      editable: true
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      editable: true,
      render: (is_active) => <div>{is_active ? 'Active' : 'Inactive'}</div>
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      render: (_, record) =>
        habits.length >= 1 ? (
          <Popconfirm
            title="Are you sure?"
            onConfirm={() => handleDelete(record.id)}
          >
            <a>Delete</a>
          </Popconfirm>
        ) : null
    }
  ];

  useEffect(() => {
    if (userOnboarding) initializePlayer();
  }, [userOnboarding]);

  function initializePlayer() {
    try {
      if (userOnboarding.onboarding_state.includes('4')) {
        loadPlayer();
      } else {
        router.replace('/account');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      console.log('InitializedPlayer');
    }
  }

  // If player is ready to load, go for it!

  async function loadPlayer() {
    console.log('Loading Player');
    fetchHabits();
  }

  async function fetchHabits() {
    try {
      const user = supabase.auth.user();

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('player', user.id);

      setHabits(data);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
      setLoading(false);
      console.log('fetchHabits - finally - ', habits);
    }
  }

  function handleDelete(id) {
    const dataSource = [...habits];
    setHabits(dataSource.filter((item) => item.id !== id));
  }

  function handleAdd() {
    const newData = {
      id: habits.length + 1,
      name: 'New Habit',
      player: user.id,
      is_active: true,
      description: null,
      exp_reward: 25,
      group: 1,
    };
    setHabits([...habits, newData]);
  }

  async function handleSave(row) {
    const newData = [...habits];
    const index = newData.findIndex((item) => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setHabits(newData);
    // need to update the database

    try {
      const user = supabase.auth.user();

      const { data, error } = await supabase
        .from('habits')
        .upsert(newData)

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false);
    }

    console.log(newData);
  }

  return (
    <section className="justify-center bg-dailies-pattern bg-fixed">
      <BottomNavbar />
      <div className=" max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
        <div className="animate-fade-in-up bg-dailies-default rounded p-10 opacity-95">
          <div className="pb-5">
            <h1 className="text-4xl font-extrabold text-center sm:text-6xl text-dailies pb-5">
              Edit Dailies
            </h1>
          </div>
          <div className="text-center my-5">
            {habits
              ? generateTable(
                  habits,
                  columns,
                  EditableRow,
                  EditableCell,
                  handleAdd,
                  handleSave
                )
              : null}
          </div>

          <div className="text-center my-5">
            <Link href="/dailies">
              <button className="px-5 border-2 border-dailies-dark text-center text-dailies font-bold py-2 rounded">
                Back
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

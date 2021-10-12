import Link from 'next/link';
//import Button from '@/components/ui/Button';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabase-client';
import { useUser } from '@/utils/useUser';
import { useRouter } from 'next/router';
import { Table, Input, Button, Popconfirm, Form, Select, Switch } from 'antd';
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
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex]
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
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

export default function edit({user}) {
  const [habits, setHabits] = useState(null);
  const [groups, setGroups] = useState(null);
  const [types, setTypes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  const {
    userLoaded,
    session,
    userDetails,
    userOnboarding
  } = useUser();

  const columns = [
    {
      title: 'Icon',
      dataIndex: 'icon',
      width: '5%',
      render: (icon, record) => (
        <IconPicker
          value={icon}
          onChange={(v) => handleEdit(v, record, 'icon')}
        />
      )
    },
    {
      title: 'Habit',
      dataIndex: 'name',
      width: '35%',
      editable: true
    },
    {
      title: 'Group',
      dataIndex: 'group',
      width: '15%',
      responsive: ['md'],
      // editable: true,
      // render: (group) =>
      //   (<div>{groups!= null ? groups.at(group-1).name : group}</div>)
      render: (group, record) => {
        return (
          <Select
            style={{ width: 200 }}
            value={groups != null ? groups.at(group - 1).name : group}
            onChange={(v) => handleEdit(v, record, 'group')}
            // showSearch
            // optionFilterProp="children"
            // filterOption={(input, option) =>
            //   option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            // }
          >
            {groups != null ? (
              groups.map((a) => (
                <Select.Option key={a.id} value={a.id}>
                  {a.name}
                </Select.Option>
              ))
            ) : (
              <div />
            )}
          </Select>
        );
      }
    },
    {
      title: 'Sort',
      dataIndex: 'sort',
      width: '5%',
      responsive: ['lg'],
      editable: true
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: '10%',
      responsive: ['lg'],
      // render: (type) => (
      //   <div>{types != null ? types.at(type - 1).name : type}</div>
      // )
      render: (type, record) => {
        return (
          <Select
            style={{ width: 200 }}
            value={types != null ? types.at(type - 1).name : type}
            onChange={(v) => handleEdit(v, record, 'type')}
            // showSearch
            // optionFilterProp="children"
            // filterOption={(input, option) =>
            //   option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            // }
          >
            {types != null ? (
              types.map((a) => (
                <Option key={a.id} value={a.id}>
                  {a.name}
                </Option>
              ))
            ) : (
              <div />
            )}
          </Select>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      responsive: ['md'],
      // editable: true,
      width: '10%',
      // render: (is_active) => <div>{is_active ? 'Active' : 'Inactive'}</div>
      render: (is_active, record) => {
        return (
          <Switch
            checked={is_active}
            checkedChildren="Show"
            unCheckedChildren="Hide"
            onChange={(v) => handleEdit(v, record, 'status')}
          />
        );
      }
    },
    // {
    //   title: 'Action',
    //   dataIndex: 'action',
    //   width: '5%',
    //   align: 'center',
    //   responsive: ['md'],
    //   render: (_, record) =>
    //     habits.length >= 1 ? (
    //       <Popconfirm
    //         title="Are you sure?"
    //         onConfirm={() => handleDelete(record.id)}
    //       >
    //         <i className="fas fa-trash cursor-pointer" />
    //       </Popconfirm>
    //     ) : null
    // }
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
        .eq('player', user.id)
        .order('group', { ascending: true })
        .order('sort', { ascending: true })
        .order('name', { ascending: true });

      setHabits(data);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
      setLoading(false);
    }

    try {
      const { data, error } = await supabase
        .from('habit_group')
        .select('*')
        .or('player.eq.'+user.id+', player.is.null')
        .order('id', { ascending: true });

      setGroups(data);
      console.log('groupData -', data);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
      setLoading(false);
    }

    try {
      const { data, error } = await supabase
        .from('habit_type')
        .select('*')
        .order('id', { ascending: true });

      setTypes(data);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(id) {
    const dataSource = [...habits];
    setHabits(dataSource.filter((item) => item.id !== id));

    // delete doesn't actually remove anything from the database
  }

  async function handleEdit(v, row, column) {
    setSaving(true);

    const newData = [...habits];
    const index = newData.findIndex((item) => row.id === item.id);
    const item = newData[index];
    if (column === 'icon') {
      newData.splice(index, 1, { ...item, icon: v });
    } else if (column === 'status') {
      newData.splice(index, 1, { ...item, is_active: v });
    } else if (column === 'group') {
      newData.splice(index, 1, { ...item, group: v });
    } else if (column === 'type') {
      newData.splice(index, 1, { ...item, type: v });
    }
    setHabits(newData);
    // need to update the database

    try {
      const user = supabase.auth.user();

      const { data, error } = await supabase.from('habits').upsert(newData);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
      setSaving(false);
    }

    console.log(newData);
  }

  async function handleAdd() {
    const newRow = {
      description: null,
      exp_reward: 25,
      group: 1,
      icon: 'FaMeteor',
      is_active: true,
      name: 'New Habit',
      player: user.id,
      sort: 1,
      type: 1
    };

    try {
      const user = supabase.auth.user();

      const { data, error } = await supabase.from('habits').insert(newRow);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
      fetchHabits();
    }
  }

  async function handleSave(row) {
    setSaving(true);
    const newData = [...habits];
    const index = newData.findIndex((item) => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setHabits(newData);
    // need to update the database

    try {
      const user = supabase.auth.user();

      const { data, error } = await supabase.from('habits').upsert(newData);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
      setSaving(false);
    }
  }

  return (
    <section className="justify-center bg-dailies-pattern bg-fixed bg-cover bg-center">
      {saving ? (
        <span className="fixed inline-flex left-0 bottom-0 ml-2 mb-24 sm:ml-4 sm:mb-4 text-md font-semibold py-3 px-4 uppercase rounded text-emerald-600 bg-emerald-200 z-50">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-emerald-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Saving...
        </span>
      ) : (
        <div></div>
      )}
      <div className=" max-w-6xl mx-auto py-8 md:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
        <div className="animate-fade-in-up bg-dailies-default rounded p-10 opacity-90">
          <div className="pb-5 text-center">
            <h1 className="text-4xl font-extrabold sm:text-6xl text-dailies pb-5">
              Edit Dailies
            </h1>
            <div className="font-semibold text-dailies text-xl">
              Add your own daily quests and customize your day!
              <div  className="lg:invisible text-sm font-medium mt-2">More options available on desktop.</div>
            </div>
            
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

export async function getServerSideProps({ req }) {
  // Get the user's session based on the request
  const { user } = await supabase.auth.api.getUserByCookie(req);

  if (!user) {
    return {
      redirect: {
        destination: '/signin',
        permanent: false,
      },
    }
  }

  return {
    props: { user },
  }
}
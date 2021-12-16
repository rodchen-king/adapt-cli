const fs = require('fs')
const path = require('path')
const parse = require('swagger-parser')
const colors = require('colors/safe');
const pkg = require('pkg-dir')

const writeFileApi = (method, url, name) => {
  console.log(method, url)
  const { request, response } = require(`${pkg.sync()}/dataBasic/${method}-${url.replace(/\//g, '')}`)
  
  let tplIndex = `import React, { useRef, useState } from 'react';
  import SulaQueryTable from '@/components/businessComponent/SulaQueryTable';
  import { getDictionarySource, getDictionaryTextByValue, handleError, handleConvertParams } from '@/utils/utils';
  import { Badge, message, Progress, Tooltip } from 'antd';
  import { EnumTableTypeMenu } from '@/common/menu';
  import { handleCommonTimeRender } from '@/common/businessType';
  import ModalImplement from './ModalImplement';
  import { remove } from './services';
  import { convertParamsInterface } from '@/pages/coverData';
  
  const remoteDataSource = {
    url: '/srm-ops/${url}',
    method: 'GET',
    convertParams({ params }: { params: convertParamsInterface }) {
      console.log(params.filters);
      return {
        ...handleConvertParams(params.filters, ['qp-code-like'], ['date']),
        'qp-date-ge': params.filters?.date ? params.filters?.date[0] : undefined,
        'qp-date-le': params.filters?.date ? params.filters?.date[1] : undefined,
        pageSize: params.pageSize,
        currentPage: params.current,
        sorter: 'desc-createTime',
      };
    },
    converter: 'tableConvertType',
  };
  
  export default () => {
    const [ModalVisible, setModalVisible] = useState(false);
    const [ModalRecord, setModalRecord] = useState({});
    const [bssulaTableCtx, setbssulaTableCtx] = useState({});
    const hideModal = (ctx?: any) => {
      setModalVisible(false);
      setModalRecord({});
      if (ctx && ctx.table) {
        ctx.table.refreshTable();
      }
    };
    const config = {
      type: EnumTableTypeMenu.NO_ROWS_ACTION,
      remoteDataSource,
      actionsRender: [
        {
          type: 'button',
          props: {
            type: 'primary',
            children: '添加${name}',
          },
          code:'SRM_Purchase_Plan_Bill_add',
          action: [
            {
              type: 'route',
              path: '/purchase-plan-management/create-purchase-plan',
            },
          ],
        },
        {
          type: 'button',
          visible: (ctx: any) => {
            const selectedRowKeys = ctx.table.getSelectedRowKeys() || [];
            return selectedRowKeys.length;
          },
          props: {
            children: '批量删除',
            type: 'primary',
          },
          code:'SRM_Purchase_Plan_Bill_delete',
          disabled: ({ table }: any) => {
            return (
              !table?.getSelectedRows()?.length ||
              !table?.getSelectedRows()?.every((val: any) => val.status === 10)
            );
          },
          // code: 'brand-library-batchDelete',
          confirm: '确定要批量删除吗',
          action: [
            (ctx: any) => {
              const ids = ctx.table.getSelectedRowKeys().join(',');
              return new Promise((resolve, reject) => {
                remove(ids)
                  .then((res) => {
                    if (handleError(res)) {
                      message.success('批量删除成功');
                      ctx.table.refreshTable();
                      resolve(res.data);
                    } else {
                      reject();
                    }
                  })
                  .catch((error) => {
                    reject(error);
                  });
              });
            },
          ],
        },
      ],
      fields: [
        ${Object.keys(request).filter(item => {
          return ['currentPage', 'pageSize', 'sorter', 'sso-sessionid'].findIndex((innerItem) => 
            innerItem === item
          ) === -1
        }).map(item => {
          return `{
            name: '${item}',
            label: '${request[item]}',
            field: {
              type: 'input',
              props: {
                placeholder: '请输入',
                allowClear: true,
                maxLength: 32,
              }
            }
          }`
        })}
        
      ],
      rowSelection: {},
      columns: [
        ${Object.keys(response).map(item => {
          return `{
            key: '${item}',
            title: '${response[item]}',
            render: ({ text }: { text: string }) => {
              if (typeof text === 'object') return '';
              return text
            },
          }`
        })},
        {
          key: 'operat',
          title: '操作',
          fixed: 'right',
          isPermissionColumn: true,
          render: [
            {
              type: 'link',
              props: {
                children: '查看',
                type: 'primary',
              },
              action: {
                type: 'route',
                path: '/purchase-plan-management/view-purchase-plan/#{record.id}/#{record.code}',
              },
            },
            {
              type: 'link',
              props: {
                children: '编辑',
                type: 'primary',
              },
              code:'SRM_Purchase_Plan_Bill_edit',
              visible: '#{record.status === 10}',
              action: {
                type: 'route',
                path: '/purchase-plan-management/edit-purchase-plan/#{record.id}/#{record.code}',
              },
            },
            {
              type: 'link',
              props: {
                children: '提交',
              },
              // confirm: '确认提交此采购订单？',
              code:'SRM_Purchase_Plan_Bill_submit',
              visible: '#{record.status === 10}',
              action: [
                {
                  type: 'bs-operateModel',
                  title: '提交确认',
                  content: '确认提交此${name}？',
                  url: \`/srm-ops/purchasePlan/trigger?code=#{record.code}&event=SUBMIT\`,
                  method: 'POST',
                  errorMessage: '请填写单据必要信息',
                },
              ],
            },
            {
              type: 'link',
              props: {
                children: '审核',
              },
              code:'SRM_Purchase_Plan_Bill_revoke',
              visible: '#{record.status === 20 }',
              action: [
                {
                  type: 'bs-operateModel',
                  title: '提交确认',
                  content: '是否审核通过？',
                  url: \`/srm-ops/purchasePlan/trigger?code=#{record.code}&event=AUDIT\`,
                  method: 'POST',
                },
              ],
            },
            {
              type: 'link',
              props: {
                children: '撤销',
              },
              // confirm: '确认撤销此采购订单？',
              visible: '#{record.status === 20}',
              action: [
                {
                  type: 'bs-operateModel',
                  title: '提交确认',
                  content: '确认撤销此${name}？',
                  url: \`/srm-ops/purchasePlan/trigger?code=#{record.code}&event=REVOKE\`,
                  method: 'POST',
                },
              ],
            },
            {
              type: 'link',
              props: {
                children: '作废',
              },
              code:'SRM_Purchase_Plan_Bill_invalidate',
              visible: '#{record.status === 30}',
              action: [
                {
                  type: 'bs-operateModel',
                  title: '提交确认',
                  content: '确认作废此${name}？',
                  url: \`/srm-ops/purchasePlan/trigger?code=#{record.code}&event=CANCLE\`,
                  method: 'POST',
                },
              ],
            },
            {
              type: 'link',
              props: {
                children: '执行',
              },
              code:'SRM_Purchase_Plan_Bill_execute',
              visible: '#{record.status === 30 || record.status === 40}',
              action: (ctx: any) => {
                setModalVisible(true);
                setModalRecord(ctx.record);
                setbssulaTableCtx(ctx);
                ctx.table.refreshTable();
              },
            },
            {
              type: 'link',
              props: {
                children: '完成',
              },
              code:'SRM_Purchase_Plan_Bill_finish',
              visible: '#{record.status === 30 || record.status === 40}',
              action: [
                {
                  type: 'bs-operateModel',
                  title: '提交确认',
                  content: '确认完成此${name}？',
                  url: \`/srm-ops/purchasePlan/trigger?code=#{record.code}&event=FINISH\`,
                  method: 'POST',
                },
              ],
            },
            {
              type: 'link',
              props: {
                children: '删除',
              },
              code:'SRM_Purchase_Plan_Bill_delete',
              visible: '#{record.status === 10}',
              action: [
                {
                  type: 'bs-operateModel',
                  title: '提交确认',
                  content: '确认删除此${name}？',
                  url: \`/srm-ops/purchasePlan/#{record.id}\`,
                  method: 'DELETE',
                },
              ],
            },
          ],
        },
      ],
      rowKey: 'id',
    };
  
    const modalProps = {
      visible: ModalVisible,
      listRecord: ModalRecord,
      bssulaTableCtx: bssulaTableCtx,
      handleCancel: hideModal,
    };
  
    return (
      <div>
        <SulaQueryTable {...config} />
        {modalProps.visible && <ModalImplement {...modalProps} />}
      </div>
    );
  };
  `;
  fs.writeFileSync(`${process.cwd()}/index.tsx`, tplIndex);
}

module.exports = writeFileApi

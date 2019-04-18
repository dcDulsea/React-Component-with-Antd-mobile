import React, {Component, Fragment} from 'react';
import '.／TableComponent.css';
import DropToggle from '.／DropToggle';

function handleTheadData(columns, expandedRowRender){
  const theadData = columns.map((item) => {
    let textAlign;
    if(item.align){
      textAlign = `${item.align}`;
    }else{
      textAlign = 'left';
    }
    return (
      <th style={{textAlign: textAlign}}
          key={item.key}
      >{item.title}</th>
    )
  });
  if(expandedRowRender){
    const expandedCol = <th className="expand-icon" key="expand-icon-col"></th>
    theadData.splice(1,0,expandedCol);
  }
  return theadData;
}

function handleTbodyData(dataSource,columns,expandedRowRender,firstRenderExpand,isShowExpandRow,changeExpandState){
  const rowData = dataSource.map((rowItem, rowIndex, rowArray) => {
    const column = columns.map(colItem => {
      let cellData = rowItem[colItem.dataIndex];
      if(colItem.render){
        cellData = colItem.render(cellData,rowItem,rowIndex);
      }
      return(
        <td style={colItem.align ? {textAlign: `${colItem.align}`} : {textAlign: 'left'}}
            key={colItem.key}
        >{cellData}</td>
      )
    });
    if(expandedRowRender){
      if(rowItem.expand){
        const iconCol = <td key={`expand-icon-${rowIndex}`} className="expand-icon"><DropToggle onToggleClick={()=>{changeExpandState(rowIndex)}}/></td>
        column.splice(1,0,iconCol);
      }else{
        const whiteSpace = <td key={`expand-icon-${rowIndex}`} className="expand-icon"></td>
        column.splice(1,0,whiteSpace);
      }
    }
    return (
      <Fragment key={rowIndex}>
        <tr key={rowItem.key} style={{height:rowItem.height}} >{column}</tr>
        {rowItem.expand && (firstRenderExpand[rowIndex] && <tr className="expand-row" style={isShowExpandRow[rowIndex]} key={`expand-row-${rowIndex}`}><td  colSpan={`${column.length+1}`}>{expandedRowRender(rowItem)}</td></tr>)}
      </Fragment>
    )
  });
  return rowData;
}

//基础表格
class Table extends Component{
  constructor(props){
    super(props);
    this.trNode = [];
    this.state = {
          firstRenderExpand: this.props.dataSource.map(() => false),
          isShowExpandRow: this.props.dataSource.map(() => ({display: 'none'}))
    }
  }
  
  componentWillReceiveProps(nextProps){
    this.setState({
        firstRenderExpand: nextProps.dataSource.map(() => false),
        isShowExpandRow: nextProps.dataSource.map(() => ({display: 'none'}))
    })
  }
  
  renderCol = (expandedRowRender,index,columns,item) => {
    let width ;
    if(expandedRowRender){
      if(index < 1){
        if(columns[index].width){
          width = columns[index].width + 'px';
          console.log(width)
        }
        return (<col style={{width: width,minWidth: width}} key={columns[index].key}/>)
      }else if(index === 1){
        return (<col className="expand-icon" style={{width: '50px',minWidth: '50px'}} key={item.key}/>)
      }else{
        if(columns[index-1].width){
          width = columns[index-1].width + 'px';
        }
        return (<col style={{width: width,minWidth: width}} key={columns[index-1].key}/>)
      }
    }
    if(columns[index].width){
      width = columns[index].width + 'px';
    }
    return (<col style={{width: width,minWidth: width}} key={columns[index].key}/>)
  }
  changeExpandState = (index) => {
    const {firstRenderExpand} = this.state;
    let isShowExpandRow = this.state.isShowExpandRow;
    firstRenderExpand.splice(index,1,true);
    const isHaveKey = Object.keys(isShowExpandRow[index]).length;
    if(isHaveKey === 0){
      isShowExpandRow[index] = {display: 'none'}
    }else{
      isShowExpandRow[index] = {}
    }
    this.setState({firstRenderExpand:firstRenderExpand,isShowExpandRow: isShowExpandRow})
  }

  render(){
    const {dataSource,columns,tableContentWidth,expandedRowRender,scroll} = this.props;
    const {firstRenderExpand,isShowExpandRow} = this.state;
    const theadData = handleTheadData(columns,expandedRowRender);
    const rowData = handleTbodyData(dataSource,columns,expandedRowRender,firstRenderExpand,isShowExpandRow,this.changeExpandState);
    return(
      scroll&&scroll.y ? (
        <div className="table-component-scroll-y">
          <div className="table-thead">
            <table className="table-component" style={{width:tableContentWidth}}>
              <colgroup>
              {theadData.map((item,index) => {
                return this.renderCol(expandedRowRender,index,columns,item)
              })}
              </colgroup>
              <thead>
                <tr>
                  {theadData}
                </tr>
              </thead>
            </table>
          </div>
          <div className="table-tbody" style={{overflowY: 'scroll',height: `${scroll.y}px`}}>
            <table className="table-component" style={{width:tableContentWidth}}>
                <colgroup>
                  {theadData.map((item,index) => {
                    return this.renderCol(expandedRowRender,index,columns,item)
                  })}
                </colgroup>
                <tbody>
                  {rowData}
                </tbody>
            </table>
          </div>
        </div>
      ) : (
        <table className="table-component" style={{width: tableContentWidth}}>
          <colgroup>
            {theadData.map((item,index) => {
              return this.renderCol(expandedRowRender,index,columns,item)
            })}
          </colgroup>
          <thead>
            <tr>
              {theadData}
            </tr>
          </thead>
        <tbody>
          {rowData}
        </tbody>
      </table>
      )
    )
  }
}

//固定列表格
class FixedColumn extends Component{
  render(){
    const {dataSource,columns,fixed} = this.props;
    let className = "table-component-content";
    fixed === 'left' && ( className = className + ' table-component-fixed-left');
    fixed === 'right' && ( className = className + ' table-component-fixed-right');
    return(
      <div className={className}>
        <Table dataSource={dataSource} columns={columns}/>
      </div>
    )
  }
}

//导出的表格组件
class TableComponent extends Component{
  table = null;
  state = {
    height: []
  }
  handleRowHeight = (columns) => {
    for(let i=0;i<columns.length;i+=1){
        if(columns[i].fixed){
            const _this = this;
            setTimeout(function(){
                const row = _this.table.childNodes[0].childNodes[2].childNodes;
                const rowHeight = [];
                for(let i=0;i<row.length;i+=1){
                    rowHeight.push(row[i].childNodes[0].offsetHeight)
                }
                _this.setState({height: rowHeight})
            },1);
            return
        }
    }
  }
  componentDidMount(){
    const {columns} = this.props;
    this.handleRowHeight(columns)
  }
  componentWillReceiveProps(nextProps){
    const {columns} = nextProps;
    this.handleRowHeight(columns);
  }
  render(){
    const {dataSource,columns,scroll,expandedRowRender} = this.props;
    const { height } = this.state;
    let tableComponentContent = 'table-component-content';
    let tableContentWidth;
    let fixedLeft = false;
    let fixedRight = false;
    let columnsLeft = [];
    let columnsRight = [];
    if(scroll&&scroll.x){
      tableContentWidth = scroll.x;
      for(let i=0;i<columns.length;i++){
        columns[i].fixed && (tableComponentContent = 'table-component-content-scroll');
        if(columns[i].fixed === 'left'){
          fixedLeft = true;
          columnsLeft.push(columns[i]);
        }
        if(columns[i].fixed === 'right'){
          fixedRight = true;
          columnsRight.push(columns[i])
        }
      }
      if(fixedLeft) {
        var dataLeft = dataSource.map((item,index) => {
          let dataCell = {key: index};
          for(let i=0;i<columnsLeft.length;i++){
            dataCell[columnsLeft[i].dataIndex] = item[columnsLeft[i].dataIndex]
          }
          dataCell['height'] = height[index]
          return dataCell;
        })
      }
      if(fixedRight) {
        var dataRight = dataSource.map((item,index) => {
          let dataCell = {key: index};
          for(let i=0;i<columnsRight.length;i++){
            dataCell[columnsRight[i].dataIndex] = item[columnsRight[i].dataIndex]
          }
          dataCell['height'] = height[index]
          return dataCell;
        })
      }
    }
    let fixed = false;
    if(fixedLeft || fixedRight){
      fixed = true;
    }
    return(
      <div className="table-component-container">
        <div className={tableComponentContent} ref={node => this.table = node}>
          <Table dataSource={dataSource} 
                 columns={columns} 
                 tableContentWidth={tableContentWidth}
                 expandedRowRender={expandedRowRender}
                 scroll={scroll}
                 handleTbodyHeight={this.handleTbodyHeight}
                 fixed={fixed}
                 />
        </div>
        {fixedLeft && (<FixedColumn dataSource={dataLeft} columns={columnsLeft} fixed='left'/>)}
        {fixedRight && (<FixedColumn dataSource={dataRight} columns={columnsRight} fixed='right'/>)}
      </div>
    )
  }
}

export default TableComponent;
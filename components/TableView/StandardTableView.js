import React, { PropTypes } from 'react';
import './standardTableView.css'
import Pagination from './pagination'
import TableFilter from './TableFilter'
import tableview from './tableview.css'
import DropdownMenu from './DropdownMenu'
import DropdownTextbox from './DropdownTextbox'

class StandardTableView extends React.Component {
  constructor(props){
    super(props);
    this.standardKey = this.props.standardKey;

    let isControlSelected=this.initControlStatus(6,0);
    //checkboxes
    this.state={
      isControlSelected,
      ifAllSelected: false,
      numberPerPage: 6,
      currentPage: 0,
      detail: Object.entries(this.props.detail)
    }
    this.selectedNumber =0;
  }
  componentDidMount() {
    
  }

  componentDidUpdate() {
    
  }

  componentWillUnmount(){
    
  }

  initControlStatus = (size,value)=>{
    let isControlSelected=[];
    for(let i=0;i<size;i++){
      isControlSelected[i] =value;
    }
    return isControlSelected;
  }

  toggleSelectAll = ()=>{
    let isControlSelected = [...this.state.isControlSelected];
    this.selectedNumber = isControlSelected.reduce((accum,item)=>accum+item,0);
    let ifAllSelected = false;
    if(this.selectedNumber < this.paginatedDetail.length){
      for(let i=0;i<this.paginatedDetail.length;i++){
        isControlSelected[i]=1;
      }
      this.showSelectMenu();
      this.selectedNumber = this.paginatedDetail.length;
      ifAllSelected=true;
    }else{
      for(let i=0;i<this.paginatedDetail.length;i++){
        isControlSelected[i]=0;
      }
      this.hideSelectMenu();
      this.selectedNumber =0;
      ifAllSelected=false;
    }
    this.setState({
      isControlSelected,
      ifAllSelected
    })
  }


  selectCheckbox = (controlid)=>{
    return (()=>{
      let isControlSelected = [...this.state.isControlSelected];
      isControlSelected[controlid] = isControlSelected[controlid]===0?1:0;
      this.setState({
        isControlSelected
      })
      if(isControlSelected[controlid]===0){
        this.selectedNumber--;
      }else{
        this.selectedNumber++;
      }
      
      if(this.selectedNumber===0){
        this.hideSelectMenu();
      }else{
        this.showSelectMenu();
      }
      
    }).bind(this);
  }

  showSelectMenu = ()=>{
    let selectmenu = $("#selectMenu");
    if(selectMenu){
      selectmenu.css("opacity",1);
      selectmenu.css("transition","opacity 0.2s");
    }
  }

  hideSelectMenu = ()=>{
    let selectmenu = $("#selectMenu");
    if(selectMenu){
      selectmenu.css("opacity",0);
      selectmenu.css("transition","opacity 0.2s");
    }
  }

  setPageNumber=()=>{
    return (currPage)=>{
      this.setState({
        currentPage: currPage,
        isControlSelected:this.initControlStatus(this.state.numberPerPage,0),
        ifAllSelected: false
      });
      this.hideSelectMenu();
    }
  }

  setNumberPerPage=()=>{
    return (numPerPage)=>{
      this.setState({
        numberPerPage: numPerPage,
        isControlSelected:this.initControlStatus(numPerPage,0),
        ifAllSelected: false
      });
      this.hideSelectMenu();
    }
  }

  addFilter = (field, containedWord)=>{
    let filtered=[];
    if(field === 'ControlName'){
      filtered = this.state.detail.filter((item)=>item[0].indexOf(containedWord)>-1);
    }
    if(field === 'Status'){
      filtered = this.state.detail.filter((item)=>item[1]['implementation_status'].indexOf(containedWord)>-1);
    }
    this.setState({
      detail:filtered,
      isControlSelected:this.initControlStatus(this.state.numberPerPage,0),
      ifAllSelected: false
    })
    this.hideSelectMenu();
  }

  clearFilters=()=>{
    this.setState({
      detail:Object.entries(this.props.detail),
      isControlSelected:this.initControlStatus(this.state.numberPerPage,0),
      ifAllSelected: false
    })
    this.hideSelectMenu();
  }

  setStatusInBatch=(status)=>{
    for(let i=0;i<this.paginatedDetail.length;i++){
      console.log(this.paginatedDetail[i][0],status)
    }
  }
  setImplementationStatus = (control1)=>{
    return (status)=>{
      control1.implementation_status = status;
    }
  }

  render() {
    let start = this.state.numberPerPage*this.state.currentPage;
    let end = start+this.state.numberPerPage;
    this.paginatedDetail = this.state.detail.slice(start,end);
    console.log(this.paginatedDetail)
    
    let totalRecordNum = this.state.detail.length;
    // console.log('render',totalRecordNum)
    return (<div>
    <div className={tableview.row}>
      <TableFilter totalRecordNum={totalRecordNum} addFilter={this.addFilter} clearFilters={this.clearFilters}/>
    </div>
    {/* Table HTML */}
    <table className="table table-striped table-bordered table-hover" id="table1" style={{"minWidth":"0",tableLayout: "fixed", width: "100%"}}>
    <thead><tr>
    <th style={{width:"35px"}}><input type="checkbox" checked={this.state.ifAllSelected} onChange={this.toggleSelectAll}/></th>
    <th colSpan="7">
      <div className={tableview.row} style={{transform:'translateY(10%)'}}>
        <div style={{opacity:0}} id="selectMenu" className={tableview.left}>
          <span>Set status ...</span>
          <DropdownMenu onSelect={this.setStatusInBatch} items={['Complete','Partial','Unknown','Planned','Not Applicable']}/>
        </div>
        <div className={tableview.right}>
          <Pagination totalRecordNum={totalRecordNum} setNumberPerPage={this.setNumberPerPage()} setPageNumber={this.setPageNumber()}/>
        </div>
      </div>
    </th></tr></thead>
      <thead>
        <tr>
          <th></th>
          <th>ControlName</th>
          <th>CoveredBy</th>
          <th colSpan="4">Narrative</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
      {this.paginatedDetail.map((control,controlid)=>{
        
        let suffix = '-'+this.standardKey+'-'+controlid;
        return(
        <tr key={controlid}>
          <td>
            <label className="sr-only" >Select all rows</label>
            <input type="checkbox" onChange={this.selectCheckbox(controlid)} checked={this.state.isControlSelected[controlid]}/>
          </td>
          
          <td>{control[0]}</td>
          <td>{control[1].covered_by}</td>
          <td colSpan="4" style={{padding:0, wordWrap: "break-word"}}>
          {(control[1].narrative)?(
              <div style={{margin:'5px'}}>
            {control[1].narrative.map((item,itemid)=>(<DropdownTextbox text={item.text} id={suffix+'-'+itemid} key={itemid}/>))}
            </div>)
              :(<div></div>)}
          </td>

          <td>{control[1].implementation_status==='complete'?(
            <div style={{fontSize: '1.2em',margin: '5px'}}>
              <span className="pficon pficon-ok" style={{width:'20px'}}></span>
            </div>
          ):control[1].implementation_status==='partial'?(
            <div style={{fontSize: '1.2em',margin: '5px'}}>
              <span className="pficon pficon-warning-triangle-o" style={{width:'20px'}}></span>
            </div>
          ):(
            <div style={{fontSize: '1.2em',margin: '5px'}}>
              <span className="pficon pficon-error-circle-o" style={{width:'20px'}}></span>
            </div>
          )}
          <DropdownMenu onSelect={this.setImplementationStatus(control[1])} items={['Not applicable', 'None','Unknown','Implemented','Planned','Partial', 'Complete']}/>
          </td>
          
        </tr>
        )
        })}
        

      </tbody>
      
    </table>
  </div>
    )
  }

}

export default StandardTableView;

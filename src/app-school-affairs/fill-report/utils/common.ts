export const uGetDom = (instance: any, selector: string) => {
  return new Promise<Required<UniApp.NodeInfo>>((resolve) => {
    uni
      .createSelectorQuery()
      .in(instance)
      .select(selector)
      .boundingClientRect((ret: any) => {
        resolve(ret);
      })
      .exec();
  });
};

export const uGetDoms = (instance: any, selector: string) => {
  return new Promise<Required<UniApp.NodeInfo>[]>((resolve) => {
    uni
      .createSelectorQuery()
      .in(instance)
      .selectAll(selector)
      .boundingClientRect((ret) => {
        resolve(ret as any[]);
      })
      .exec();
  });
};
//获取当前时间 (年月日时分)
export const currentTimeToM = () => {
  var currentDate = new Date();
  var year:any = currentDate.getFullYear();
  var month:any = currentDate.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  var date:any = currentDate.getDate();
  if (date < 10) {
    date = "0" + date;
  }
  var hours:any = currentDate.getHours();
  if (hours < 10) {
    hours = "0" + hours;
  }
  var minutes:any = currentDate.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  var formattedDate =
    year + "-" + month + "-" + date + " " + hours + ":" + minutes;

  return  formattedDate;
};
//获取当前时间下一个小时 (年月日时分)
export const currentTimeToNextHour = () => {
  var currentDate = new Date();
  var year:any = currentDate.getFullYear();
  var month:any = currentDate.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  var date:any = currentDate.getDate();
  if (date < 10) {
    date = "0" + date;
  }
  var hours:any = currentDate.getHours()+1;
  if (hours < 10) {
    hours = "0" + hours;
  }
  var minutes:any = currentDate.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  var formattedDate =
    year + "-" + month + "-" + date + " " + hours + ":" + minutes;

  return  formattedDate;
};
//比较时间大小 (时分) 比如: '07:00' '06:00'
export const compareTime = (start,end) => {
var startTime = parseInt(start.split(":")[0]) * 60 + parseInt(start.split(":")[1]);  
var endTime = parseInt(end.split(":")[0]) * 60 + parseInt(end.split(":")[1]); 
if(endTime<=startTime){
  return false;
}else{
  return true;
}
};
//将时间戳转化为年月日时分
export const timestampToDate=(timestamp)=> {  
  if(!timestamp){
    return
  }
  var date = new Date(timestamp); 
  var year = date.getFullYear();  
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');  
  var hours = String(date.getHours()).padStart(2, '0');  
  var minutes = String(date.getMinutes()).padStart(2, '0');  

  return `${year}-${month}-${day} ${hours}:${minutes}`;   
}  
//将时间戳转化为年月日
export const timestampToDay=(timestamp)=> {  
  if(!timestamp){
    return
  }
  var date = new Date(timestamp); 
  var year = date.getFullYear();  
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');  
  return `${year}-${month}-${day}`;   
}  
//将时间戳转化为时分
export const timestampToMinutes=(timestamp)=> {  
  if(!timestamp){
    return
  }
  var date = new Date(timestamp); 
  var hours = String(date.getHours()).padStart(2, '0');  
  var minutes = String(date.getMinutes()).padStart(2, '0');  
  
  return `${hours}:${minutes}`;    
}  

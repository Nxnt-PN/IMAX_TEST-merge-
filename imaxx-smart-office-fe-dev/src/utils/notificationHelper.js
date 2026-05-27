import { faPaperPlane, faCheckCircle, faXmarkCircle, faGear } from "@fortawesome/free-solid-svg-icons";

export const getIcons = (type)=>{
    if(type === ('submit')) {
      return iconSetting['submit'];
    } else if(type === ('approved')) {
      return iconSetting['approve'];
    } else if(type === ('reject')) {
      return iconSetting['reject'];
    } else {
      return iconSetting['other'];
    }
  }

export const iconSetting = {
    'submit':{
      icon:faPaperPlane,
      class:"text-primary",
    },
    "approve":{
      icon:faCheckCircle,
      class:"text-success",
    },
    "reject": {
      icon:faXmarkCircle,
      class:"text-danger"
    },
    "other":{
      icon:faGear,
      class:"text-secondary",
    }
  }
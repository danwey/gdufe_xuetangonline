import fetch from 'node-fetch';

//个人用户信息
let user_id = 14295004;

let base_url = "https://gdufe.xuetangonline.com";

//设置请求头
let headers = {
  "accept": "*/*",
  "content-type": "application/json",
  "accept-language": "zh-CN,zh;q=0.9",
  "university-id": "2730",
  "x-csrftoken": "0u0SD5aiG3C8HhlSkmlhV5LgH6eGcYGk",
  "xtbz": "cloud",
  "cookie": "university_id=2730; platform_id=3; login_type=WX; django_language=zh-cn; csrftoken=0u0SD5aiG3C8HhlSkmlhV5LgH6eGcYGk; sessionid=oqerdwvlfr1egnn357bpofrxu6aeeq9f; user_role=3; dep=33233",
};

function sleep(time = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  })
};

//获取科目列表
async function getCourselist() {
  let url = base_url + "/mooc-api/v1/lms/user/user-courses/?status=1&page=1&no_page=1&term=latest&uv_id=2730&dep=33233"
  let res = await fetch(url, {
    method: "GET",
    headers: headers
  });
  let json = await res.json();
  // classroom_id
  // course_name
  let courseArray = [];
  json["data"]["product_list"].forEach(item => {
    let course = {
      classroom_id: item["classroom_id"],
      course_name: item["course_name"],
    };
    courseArray.push(course);
  });
  return courseArray;
}

//获取科目ID
async function getCourseID(classroom_id) {
  let url = base_url + "/mooc-api/v1/lms/learn/course/chapter?cid=" + classroom_id + "&sign=8vkHENv6mif&term=latest&uv_id=2730"
  let response = await fetch(url, {
    "headers":headers,
    "body": null,
    "method": "GET"
  });
  let res = await response.json();
  
  let course_id = res["data"]["course_id"];
  return course_id;
}

////获取课程进度列表
async function getCourseSchedule(classroom_id) {
  let url = base_url + "/mooc-api/v1/lms/learn/course/schedule?cid=" + classroom_id + "&sign=8V4QCnMdxxM&term=latest&uv_id=2730"
  let response = await fetch(url, {
    "headers":headers,
    "body": null,
    "method": "GET"
  });
  let res = await response.json();
  // console.log(res);
  let data = res['data']['leaf_schedules'];
  return data;
}

//获取课程列表
async function getSubjectList(classroom_id, subliect_id, sku_id, schedule) {
  let url = base_url + "/mooc-api/v1/lms/learn/course/chapter?cid=" + classroom_id + "&sign=8V4QCnMdxxM&term=latest&uv_id=2730"
  let response = await fetch(url, {
    "headers":headers,
    "body": null,
    "method": "GET"
  });
  let courseArray = [];
  let res = await response.json();
  //course_id
  let c_id = res["data"]["course_id"];
  //courseArray
  res['data']['course_chapter'].forEach(item1 => {
    item1['section_leaf_list'].forEach(item2 => {
      let item2_leaf_list = item2['leaf_list'];
      if (item2_leaf_list && item2_leaf_list.length > 0) {
        item2['leaf_list'].forEach(item3 => {
          // 如果item3包含字符串"学习"，则不输出
          if (item3['name'].indexOf('练习') === -1 ) {//可能会误杀，跑一遍到网站确认一下
            let itemId = item3['id'] + "";
            let id = parseInt(schedule[itemId]);
            let course = {
              "course_id": subliect_id,
              "vcourse_id": item3["id"],
              "sku_id": sku_id,
              "course_main_name": item2["name"],
              "course_name": item3['name'],
              "c_id": c_id,
              "order": item3['order'],
              "classroom_id": classroom_id,
            };
            if (id != 1) {
              courseArray.push(course);
            }else {
              console.log(course['course_main_name'] + "--------" + course['course_name'] + ",课程已学完");
            }
          }
        })
      }
    })
  });
  return courseArray;
}

//获取课程SKU
async function getCourse_sku_id(classroom_id) {
  let url = base_url + "/c27/online_courseware/course/classroom/" + classroom_id + "/0/sku_list/?_date=1639745530496&term=latest"
  let response = await fetch(url, {
    "headers":headers,
    "body": null,
    "method": "GET"
  });
  let res = await response.json();
  let data = res['data']['data_list'][0];
  let sku_id = data["sku_id"];
  return sku_id;
}

//处理课程列表
async function handleCourseList(course) {
    let data = {
    "i": 5,//5秒一次
    "et": "heartbeat",//上传进度
    "p": "web",
    "n": "ali-cdn.xuetangx.com",
    "lob": "cloud4",
    "cp": 0,//当前进度
    "fp": 0,
    "tp": 0,//刚开始进度
    "sp": 1,
    "ts": "1639745046201",//时间戳
    "u": user_id,//用户id 登录后，可有
    "uip": "",
    "c": course["c_id"],//course["course_id"],
    "v": course["vcourse_id"],//课程id 打开课程后，可有
    "skuid": course["sku_id"],//api获取 
    "classroomid": course["classroom_id"],//同上
    "d": 1200,//时长
    "pg": course["vcourse_id"] + "_dan",
    "sq": 12,
    "t": "video"
  };

  let conut = 50;
  // let time = new Date();
  let dateTime = "1639745046201";
  dateTime = dateTime - conut * 1000;
  let array = [];
  for(let i = 0; i < conut; i++){
    let newData = Object.assign({}, data);
    newData["cp"] = ((i+1) * data["d"]/conut).toFixed(2);
    // let dateTime = Date.now();
    let newDateTime = dateTime + 1000*(i + 1);
    newData["sq"] = i + 1;
    newData["ts"] = newDateTime + "";
    array.push(newData);
  }

  // console.log(array);
  let heart_data = {};
  heart_data["heart_data"] = array;
  let string = JSON.stringify(heart_data);
  // console.log(string);

  let url = base_url + "/video-log/heartbeat/";
  let response = await fetch(url, {
    "headers": headers,
    "body": string,
    "method": "POST"
  });
  let res = await response.json();
  // console.log(res);
  console.log(course['course_main_name'] + "--------" + course['course_name'] + ",课程处理完成");

  return true;
}

//主函数
async function main() {
  console.log("开始");

  let courseIDList = await getCourselist();
  // console.log(courseIDList);

  for(let i = 0; i < courseIDList.length; i++) {
    let classroom_id = courseIDList[i]["classroom_id"];
    let course_name = courseIDList[i]["course_name"];
    console.log("第" + (i + 1) + "个课程:" + course_name);
  
    let course_id = await getCourseID(classroom_id);
    let sku_id = await getCourse_sku_id(classroom_id);
    // console.log(courseId);

    let courseSchedule = await getCourseSchedule(classroom_id);
    // console.log(courseSchedule);
    
    let list = await getSubjectList(classroom_id, course_id,sku_id, courseSchedule);
      // console.log(list);

    for(let j = 0; j < list.length; j++) {
      let course = list[j];
      let res = await handleCourseList(course);
      await sleep(5000);
    }

  }
  console.log("结束");
}

main();

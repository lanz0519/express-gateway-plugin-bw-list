const redis = require('../../express-gateway/lib/db');
module.exports = {
  name: 'bw-list',
  schema: {
    $id: 'express-gateway-plugin-bw-list',
    type: 'object',
    properties: {
      mode: {
        tpye: 'string'
      },
      level: {
        type: 'string'
      }
    },
    required: ['mode', 'level']
  },
  policy: (actionParams) => {
    const that = this;
    const filterMode = {
      black: list => {
        return filterBlack
      },
      white: list => {
        return filterWhite
      }
    }
    return async (req, res, next) => {
      // 初始化数据
      const { objId } = req.cookies
      const { level,mode } = actionParams
      const listName = `${level}${upCaseFirst(mode)}List`

      // 测试，设置一个白名单/黑名单用户
      let date = new Date()
      date.setFullYear(date.getFullYear()+1);
      redis.hset(listName,objId,date.toLocaleDateString())
      

      const list = await filterList(level, listName, objId).then(res => {
        return res
      })
      const filter = filterMode[mode](list)

      if (filter(list)) {
        res.status(400).send('禁止访问');
      } else {
        redis.hdel(listName,objId)
        next()
      }
    }
  }
};

function filterList (level, listName, id) {
  if (level == 'gobal') {
    return redis.hget(listName,id)
  } else {
    return redis.hget(listName,id)
  }
}

function filterBlack (list) {
  let nowTime = new Date().toLocaleDateString()
  return list >= nowTime
}

function filterWhite (list) {
  return list ? false : true
}

function upCaseFirst (str) {
  return str.substring(0, 1).toUpperCase() + str.substring(1)
}
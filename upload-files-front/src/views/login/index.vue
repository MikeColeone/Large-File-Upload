<script setup lang="ts">
import { trigger, type RefSymbol } from '@vue/reactivity'
import { reactive, ref } from 'vue'
import { getCode } from '../../api/index'
import { ElMessage } from 'element-plus'
const imgURL = new URL('../../assert.login-head.png', import.meta.url).href
const loginForm = reactive({
  userName: '',
  password: '',
  validCode: ''
})

const formRef = ref()
const submitForm = async (formEl) => {
  if (!formEl) return
  //手动触发校验
  await formEl.value.validate((valid, fields) => {
    if (valid) {
      console.log('submit')
    } else {
      console.log('error', fields)
    }
  })
}

//表单校验
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  validCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

//切换表单
const formType = ref(0)
const handleChange = () => {
  formType.value = formType.value ? 0 : 1
}
let flag = false
const countdownChange = () => {
  if (flag) return
  //判断手机号格式
  //正则表达式
  setInterval(() => {
    if (countdown.time <= 0) {
      countdown.time = 60
      countdown.validText = '请输入验证码'
      flag = false
    }
    {
      countdown.time -= 1
      countdown.validText = `剩余${countdown.time}秒`
    }
  }, 1000)
  flag = true
  getCode({ tel: loginForm.userName }).then(({ data: any }) => {
    console.log(data, 'data')
    if (data.code === 10000) {
      ElMessage.warning('成功')
    }
  })
}

const countdown = reactive({
  validText: '获取验证码',
  time: 60
})
</script>
<template>
  <div>
    <el-row class="login-container" justify="center" :align="`middle`">
      <el-card style="max-width: 480px">
        <template #header></template>
        <div class="jump-link">
          <el-link type="primary" @click="handleChange">
            {{ formType ? '返回登陆' : '注册账号' }}
          </el-link>
        </div>
        <el-form :ref="formRef" :model="loginForm" :rules="rules">
          <el-form-item prop="username">
            <el-input v-model="loginForm.userName"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item prop="validCode">
            <el-input v-model="loginForm.validCode"></el-input>
            <template #append>
              <span @click="countdownChange">{{ countdown }}</span>
            </template>
          </el-form-item>
          <el-form-item>
            <el-button @click="submitForm">
              {{ formType ? '注册账号' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-row>
  </div>
</template>
<style lang="less" scoped>
:deep(.el-card__header) {
  padding: 0;
}
.login-container {
  height: 100%;
  .card-header {
    background-color: #899fe1;
    img {
      width: 430px;
    }
  }
  .jump-link {
    text-align: right;
    margin-bottom: 10px;
  }
}
</style>

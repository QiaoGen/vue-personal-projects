<template>
    <div class="father">
        <div class="login_window">
            <n-form ref="formRef" :model="model" :rules="rules">
                <n-form-item path="username" label="用户名：">
                    <n-input v-model:value="model.username" placeholder="请输入用户名" :maxlength="16"></n-input>
                </n-form-item>
                <n-form-item path="password" label="密码:">
                    <n-input v-model:value="model.password" placeholder="请输入密码" type="password" :maxlength="16"></n-input>
                </n-form-item>
                <n-form-item>
                    <n-button @click="handleValidateButtonClick" type="success" style="width: 100%;">登录</n-button>
                </n-form-item>
                
            </n-form>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import route from"@/router"
const formRef = ref(null)
const model = ref({
    username: null,
    password: null
})

const rules = reactive({
    username: {
        required: true,
        message: "请输入用户名",
        trigger: ['blur']
    },
    password: {
        required: true,
        message: "请输入密码",
        trigger: ['blur']
    }
})

const handleValidateButtonClick = function(e){
    e.preventDefault();
        formRef.value?.validate((errors) => {
          if (!errors) {
            window.$message.success("登陆成功");
          } else {
            window.$message.error("用户名或密码错误");
            route.replace("/MainWindow")
          }
        });
}

</script>

<style scoped>
.father{
    color: white;
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    /* background-color: white; */
    background-image: url('@/assets/bg.png');
    transition: 1s;
    z-index: 10;
}
.login_window{
    width: 300px;
    border: 1px solid rgb(255, 255, 255);
    border-radius: 10px;
    padding: 40px 20px;
    background-color: white;
}
</style>
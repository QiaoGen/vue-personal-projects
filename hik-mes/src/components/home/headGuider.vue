<template>
  <div class="head">
    <div>联动作业</div>
    <div>信号监控</div>
    <div>报警信息</div>
    <n-icon size="30" class="menu_icon" @click="activate('right')">
        <MdMenu/>
    </n-icon>
    <n-drawer v-model:show="active" :width="502" :placement="placement">
        <n-drawer-content title="参数配置">
            <n-form ref="formRef" :model="model" :rules="rules">
                <n-form-item path="WorkStation" label="MES 扫描站点">
                    <n-input v-model:value="model.WorkStation" placeholder=""></n-input>
                </n-form-item>
                <n-form-item path="MachineId" label="设备编号">
                    <n-input v-model:value="model.MachineId" placeholder=""></n-input>
                </n-form-item>
                <div style="display: flex; justify-content: flex-end">
                    <n-button
                        round
                        :disabled="model.WorkStation === null || model.MachineId === null"
                        type="primary"
                        @click="handleValidateButtonClick"
                    >
                        提交
                    </n-button>
                </div>
            </n-form>
        </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { MdMenu } from '@vicons/ionicons4'
import { ref, computed, reactive } from 'vue'
// import { useMessage } from 'naive-ui'
import store from '@/store'

// const message = useMessage()

const formRef = ref(null)
// const model = ref({
//     WorkStation: ref(computed(() => {
//     return store.state.WorkStation
// })),
//     MachineId: ref(computed(() => {
//     return store.state.MachineId
// }))
// })
const model = ref({
    WorkStation: store.state.WorkStation,
    MachineId: store.state.MachineId
})
const rules = reactive({
    WorkStation: {
        required: true,
        message: "请输入扫描站点",
        trigger: ["blur"]
    },
    MachineId: {
        required: true,
        message: "请输入设备编号",
        trigger: ["blur"]
    }
})

const active = ref(false)
const placement = ref("right");
const activate = (place) => {
    active.value = true;
    placement.value = place;
}

const handleValidateButtonClick = function(e){
    e.preventDefault();
        formRef.value?.validate((errors) => {
          if (!errors) {
            window.$message.success("验证成功");
          } else {
            console.log(errors);
            window.$message.error("验证失败");
          }
        });
}



</script>

<style>
.head{
    height: 40px;
    background-color: rgb(247, 184, 184);
    display: flex;
    align-items: center;
   
}
.menu_icon{
   cursor: pointer;
   margin-left: auto;
   margin-right: 20px;
}

</style>
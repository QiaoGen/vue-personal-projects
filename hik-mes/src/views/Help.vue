<template>
  <div class="father">
    <!-- 包括软件版本信息、当前软件运维人员联系方式、软件使用说明、问题排查指导等功能 -->
        <n-collapse class="collapse">
            <n-collapse-item title="软件使用说明" name="1">
                <div>软件使用说明</div>
            </n-collapse-item>
            <n-collapse-item title="问题排查指导" name="2">
                <div>问题排查指导</div>
            </n-collapse-item>
            <n-collapse-item title="运维人员联系方式" name="3">
                <div>...</div>
            </n-collapse-item>
            <n-collapse-item title="版本信息" name="4">
                <div>海康包装线v1.0</div>
            </n-collapse-item>
        </n-collapse>
    </div>
  <!-- </div> -->
</template>

<script>

</script>

<style scoped>
.father{
    width: 100%;
    height: 100%;
    padding: 16px 5px 5px 5px;
    /* display: flex; */
    /* flex-direction: column; */
}
.collapse{
    width: 100%;
}

</style>
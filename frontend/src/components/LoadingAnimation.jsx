/**
 * 加载动画组件
 * 
 * 这个组件实现了文件处理过程中的加载动画，包括：
 * 1. 文件加密视觉效果
 * 2. 锁定图标动画
 * 3. 粒子效果
 * 4. 自定义加载文本
 * 
 * 动画通过CSS关键帧和styled-components实现，
 * 视觉上展示了文件被加密和保护的过程
 */

import React from 'react';
// 导入styled-components和keyframes用于创建样式和动画
import styled, { keyframes } from 'styled-components';
// 导入Ant Design图标
import { LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

/**
 * 加密动画关键帧
 * 
 * 定义文件图标上升并逐渐消失的动画效果
 * 模拟文件被加密并发送的过程
 */
const encryptKeyframes = keyframes`
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-20px) scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: translateY(-40px) scale(0.5);
    opacity: 0;
  }
`;

/**
 * 锁定动画关键帧
 * 
 * 定义锁图标缩放的动画效果
 * 强调加密和安全保护的过程
 */
const lockKeyframes = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

/**
 * 动画容器样式
 * 
 * 使用flex布局居中显示所有动画元素
 * 设置固定高度和溢出隐藏
 */
const AnimationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  position: relative;
  overflow: hidden;
`;

/**
 * 文件图标基础样式
 * 
 * 创建一个类似文档的图标，包括：
 * - 白色背景和圆角
 * - 右上角折叠效果
 * - 阴影效果增强立体感
 */
const FileIcon = styled.div`
  width: 40px;
  height: 50px;
  background-color: #fff;
  border-radius: 3px;
  position: relative;
  margin: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    border-width: 10px;
    border-style: solid;
    border-color: #ddd #ddd #fff #fff;
  }
`;

/**
 * 加密中的文件图标样式
 * 
 * 继承基础文件图标样式，并添加加密动画效果
 * 通过props.delay接收不同的动画延迟时间
 */
const EncryptingFile = styled(FileIcon)`
  animation: ${encryptKeyframes} 2s infinite;
  animation-delay: ${props => props.delay || '0s'};
`;

/**
 * 锁图标样式
 * 
 * 设置锁图标的大小、颜色和动画效果
 * 使用主色调强调安全性
 */
const LockIcon = styled.div`
  font-size: 32px;
  color: var(--color-primary);
  animation: ${lockKeyframes} 2s infinite;
`;

/**
 * 动画文本样式
 * 
 * 设置加载提示文本的样式
 * 包括上边距、字体大小、颜色和居中对齐
 */
const AnimationText = styled.div`
  margin-top: 20px;
  font-size: 16px;
  color: var(--color-text);
  text-align: center;
`;

/**
 * 粒子效果样式
 * 
 * 创建小型圆形粒子，模拟数据加密过程中的视觉效果
 * 通过props接收不同的位置和动画延迟
 */
const Particle = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: var(--color-primary);
  border-radius: 50%;
  opacity: 0.7;
  animation: ${encryptKeyframes} 1.5s infinite;
  animation-delay: ${props => props.delay || '0s'};
  top: ${props => props.top || '50%'};
  left: ${props => props.left || '50%'};
`;

/**
 * 加载动画组件
 * 
 * @param {Object} props - 组件属性
 * @param {string} props.text - 显示的加载文本，默认为"正在处理文件，保护您的隐私..."
 * @returns {JSX.Element} 加载动画组件
 */
const LoadingAnimation = ({ text = "正在处理文件，保护您的隐私..." }) => {
  // 生成随机粒子数组，每个粒子有不同的延迟和位置
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: `${Math.random() * 1.5}s`,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
  }));

  return (
    <AnimationContainer>
      {/* 粒子效果：渲染多个随机位置的粒子 */}
      {particles.map(particle => (
        <Particle 
          key={particle.id} 
          delay={particle.delay} 
          top={particle.top} 
          left={particle.left} 
        />
      ))}
      
      {/* 文件图标：显示三个具有不同动画延迟的文件 */}
      <div style={{ display: 'flex' }}>
        <EncryptingFile delay="0s" />
        <EncryptingFile delay="0.3s" />
        <EncryptingFile delay="0.6s" />
      </div>
      
      {/* 锁图标：表示文件正在被加密保护 */}
      <LockIcon>
        <LockOutlined />
      </LockIcon>
      
      {/* 加载文本：显示当前处理状态 */}
      <AnimationText>{text}</AnimationText>
    </AnimationContainer>
  );
};

export default LoadingAnimation; 

const ProgressContainer = styled.div`
  width: 300px;
  margin: 20px 0;
  position: relative;

  .ant-progress-inner {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
  }

  .ant-progress-bg {
    height: 20px !important;
    background: linear-gradient(90deg, var(--color-primary), #1890ff);
    animation: progressGlow 2s ease-in-out infinite;
  }
`;

const ProgressText = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.3);
`;

const progressGlow = keyframes`
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
`;

return (
  <AnimationContainer>
    <LockIcon>
      <SafetyCertificateOutlined />
    </LockIcon>

    <ProgressContainer>
      <Progress
        percent={75}
        strokeColor="transparent"
        showInfo={false}
        status="active"
      />
      <ProgressText>75%</ProgressText>
    </ProgressContainer>

    <AnimationText>{text}</AnimationText>
  </AnimationContainer>
);
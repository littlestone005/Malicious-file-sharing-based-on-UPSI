import React from 'react';
import styled, { keyframes } from 'styled-components';
import { LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

// 加密动画效果
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

// 锁定动画效果
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

// 粒子动画容器
const AnimationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  position: relative;
  overflow: hidden;
`;

// 文件图标
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

// 加密中的文件
const EncryptingFile = styled(FileIcon)`
  animation: ${encryptKeyframes} 2s infinite;
  animation-delay: ${props => props.delay || '0s'};
`;

// 锁图标
const LockIcon = styled.div`
  font-size: 32px;
  color: var(--color-primary);
  animation: ${lockKeyframes} 2s infinite;
`;

// 文本
const AnimationText = styled.div`
  margin-top: 20px;
  font-size: 16px;
  color: var(--color-text);
  text-align: center;
`;

// 粒子效果
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

const LoadingAnimation = ({ text = "正在处理文件，保护您的隐私..." }) => {
  // 生成随机粒子
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: `${Math.random() * 1.5}s`,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
  }));

  return (
    <AnimationContainer>
      {/* 粒子效果 */}
      {particles.map(particle => (
        <Particle 
          key={particle.id} 
          delay={particle.delay} 
          top={particle.top} 
          left={particle.left} 
        />
      ))}
      
      {/* 文件图标 */}
      <div style={{ display: 'flex' }}>
        <EncryptingFile delay="0s" />
        <EncryptingFile delay="0.3s" />
        <EncryptingFile delay="0.6s" />
      </div>
      
      {/* 锁图标 */}
      <LockIcon>
        <LockOutlined />
      </LockIcon>
      
      {/* 文本 */}
      <AnimationText>{text}</AnimationText>
    </AnimationContainer>
  );
};

export default LoadingAnimation; 
import React, { FunctionComponent } from "react"
import { ErrorRecord } from "../type"
import styled from "styled-components/macro"

const ErrorHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ErrorHeaderLeftContainer = styled.div`
  display: flex;
  align-items: center;
`

const ErrorHeaderRightContainer = styled.div`
  display: flex;
  align-items: center;
`

const ErrorCausesStyled = styled.div`
  font-size: var(--size-font-big);
  line-height: var(--size-font-bigger);
  font-weight: bold;
  margin-right: var(--size-gap);
`

const ErrorCategoryStyled = styled.div`
  font-family: var(--font-stack-monospace);
  font-size: var(--size-font-small);
  line-height: var(--size-font-big);
  font-weight: bold;
  white-space: pre-wrap;
  margin-left: var(--size-gap);
`

const ErrorSmallStyled = styled.small`
  font-size: var(--size-font-small);
  color: var(--color-accents-1);
  margin-left: var(--size-gap-double);
  margin-right: var(--size-gap-double);
`

const ErrorNavStyled = styled.nav`
  & > button {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: calc(var(--size-gap-double) + var(--size-gap));
    height: calc(var(--size-gap-double) + var(--size-gap));
    font-size: 0;
    border: none;
    background-color: rgba(255, 85, 85, 0.1);
    color: var(--color-ansi-red);
    cursor: pointer;
    transition: background-color 0.25s ease;

    & > svg {
      width: auto;
      height: calc(var(--size-gap) + var(--size-gap-half));
    }

    &:hover {
      background-color: rgba(255, 85, 85, 0.2);
    }

    &:disabled {
      background-color: rgba(255, 85, 85, 0.1);
      color: rgba(255, 85, 85, 0.4);
      cursor: not-allowed;
    }

    &:first-of-type {
      border-radius: var(--size-gap-half) 0 0 var(--size-gap-half);
      margin-right: 1px;
    }

    &:last-of-type {
      border-radius: 0 var(--size-gap-half) var(--size-gap-half) 0;
    }
  }
`

const CloseButtonStyled = styled.button`
  border: 0;
  padding: 0;
  background-color: transparent;
  appearance: none;
  opacity: 0.4;
  transition: opacity 0.25s ease;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }

  & > svg {
    width: auto;
    height: calc(var(--size-double) + var(--size-gap-half));
  }
`

interface ErrorHeaderProps {
  error: ErrorRecord
  count: number
  activeIndex: number
  onPrevious?: () => void
  onNext?: () => void
  onClose?: () => void
}

export const ErrorHeader: FunctionComponent<ErrorHeaderProps> = ({
  error,
  count,
  activeIndex,
  onPrevious,
  onNext,
  onClose,
}: ErrorHeaderProps) => {
  return (
    <ErrorHeaderContainer>
      <ErrorHeaderLeftContainer>
        {error && (
          <>
            <ErrorCausesStyled>{error.causes}</ErrorCausesStyled>
            with
            <ErrorCategoryStyled>{error.category}</ErrorCategoryStyled>
          </>
        )}
      </ErrorHeaderLeftContainer>
      <ErrorHeaderRightContainer>
        {count > 1 && (
          <ErrorNavStyled>
            <button
              type="button"
              disabled={onPrevious == null ? true : undefined}
              aria-disabled={onPrevious == null ? true : undefined}
              onClick={onPrevious}
            >
              <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6.99996 1.16666L1.16663 6.99999L6.99996 12.8333M12.8333 6.99999H1.99996H12.8333Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              disabled={onNext == null ? true : undefined}
              aria-disabled={onNext == null ? true : undefined}
              onClick={onNext}
            >
              <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6.99996 1.16666L12.8333 6.99999L6.99996 12.8333M1.16663 6.99999H12H1.16663Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </ErrorNavStyled>
        )}
        <ErrorSmallStyled>
          {activeIndex} of {count} error
        </ErrorSmallStyled>
        {onClose && (
          <CloseButtonStyled type="button" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </CloseButtonStyled>
        )}
      </ErrorHeaderRightContainer>
    </ErrorHeaderContainer>
  )
}

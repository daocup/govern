import React, { useState } from 'react';
import { DropDown, Button, GU, SearchInput, IconDown, Grid, GridItem, useLayout } from '@aragon/ui';
import styled from 'styled-components';

import DaoActionCard from './components/DaoActionCard/DaoActionCard';

const Container = styled.div`
  margin-top: ${3 * GU}px;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: ${3 * GU}px;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 28px;
  line-height: 125%;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: ${3 * GU}px;
`;

const CustomActionButton = styled(Button)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  width: 134px;
  height: 44px;
  border-radius: 12px;
  box-shadow: none;
`;

const LoadMoreButton = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  width: 154px;
  height: 44px;
  border-radius: 12px;
  color: #7483ab;
  background: #ffffff;
  box-shadow: none;
  cursor: pointer;
  & > svg {
    padding-left: 2px;
  }
`;

const ActionListContainer = styled.div`
  width: 100%;
  margin-bottom: ${3 * GU}px;
`;

type actionsData = {
  governQueue: {
    __typename: string;
    id: string;
    address: string;
    nonce: string;
    containers: {
      __typename: string;
      id: string;
      state: string;
      createdAt: string;
      payload: {
        __typename: string;
        id: string;
        executionTime: string;
        title: string;
      };
    }[];
  };
};

const DaoActionsPage: React.FC = (queueData) => {
  const [selected, setSelected] = useState<number>(0);

  const FilterState = (data: actionsData['governQueue']['containers'][0]) => {
    switch (selected) {
      case 0:
        return data;
      case 1:
        return data.state === 'Executable';
      case 2:
        return data.state === 'Scheduled';
      case 3:
        return data.state === 'Challenged';
      case 4:
        return data.state === 'Executed';
      case 5:
        return data.state === 'Ruled Negatively';
      default:
        return;
    }
  };

  const RenderActions: any = (queueData: actionsData) => {
    const { layoutName } = useLayout();
    const temp: React.FC[] | any = [];
    if (queueData.governQueue) {
      queueData.governQueue.containers
        .filter((data) => FilterState(data))
        .map((data, index: number) => {
          temp.push(
            <GridItem gridColumn={layoutName === 'medium' ? '1/-1' : '1/3'}>
              <DaoActionCard
                key={index}
                date={data.createdAt}
                state={data.state}
                title={data.payload.title}
              />
            </GridItem>,
          );
        });
      return temp;
    } else return <div>Loading...</div>;
  };

  return (
    <Container>
      <HeaderContainer>
        <Title>Actions</Title>
        <CustomActionButton label="New action" />
      </HeaderContainer>
      <SearchContainer>
        <DropDown
          items={[
            'All Actions',
            'Executable',
            'Scheduled',
            'Challenged',
            'Executed',
            'Ruled Negatively',
          ]}
          css={`
            border: none;
          `}
          selected={selected}
          onChange={setSelected}
        />
        <SearchInput
          css={`
            width: 100%;
            margin-left: ${3 * GU}px;
            border-radius: 12px;
          `}
          placeholder="Type to search..."
          wide={true}
        />
      </SearchContainer>
      <ActionListContainer>
        <Grid columns={'4'}>{RenderActions(queueData)}</Grid>
      </ActionListContainer>
      <LoadMoreButton>
        <span>Load more</span>
        <IconDown />
      </LoadMoreButton>
    </Container>
  );
};

export default DaoActionsPage;

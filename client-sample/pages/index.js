import Head from 'next/head';
import { useState } from 'react';
import {
  MantineProvider,
  Container,
  Grid,
  SimpleGrid,
  Skeleton,
  useMantineTheme,
  rem,
  Textarea,
  Stack,
  Button,
  Group,
  createStyles,
  Header,
  ActionIcon,
  Input,
  Select,
  MenuItem,
} from '@mantine/core';
import { IconClick, IconMoonStars, IconSun } from '@tabler/icons-react';

export default function Home() {
  const [color, setColor] = useState('dark');
  const theme = useMantineTheme();
  const classes = useStyles();
  const PRIMARY_COL_HEIGHT = rem(400);
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState('user1');
  const [environment, setEnvironment] = useState('dev');
  const [model, setModel] = useState('gpt-3.5-turbo-0125');

  const promptResponse = async (data) => {
    console.log(data, user, environment, model);
    setLoading(true);
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + 'prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: data.prompt,
        user: user,
        env: environment,
        model: model,
      }),
    });
    const json = await response.json();
    console.log(json);
    setOutput(json.output);
    setLoading(false);
  };

  return (
    <div>
      <Head>
        <title>Prompt response logger</title>
        <meta name="description" content="Prompt response logger" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{ colorScheme: color }}
      >
        <Header height={56} mb={120}>
          <Container className={classes.inner}>
            {/* <MantineLogo size={28} /> */}
            <Group>
              <h2>Prompt response logger</h2>
              <ActionIcon
                onClick={() => setColor(color === 'dark' ? 'light' : 'dark')}
                size="lg"
                sx={(theme) => ({
                  backgroundColor:
                    theme.colorScheme === 'dark'
                      ? theme.colors.dark[6]
                      : theme.colors.gray[0],
                  color:
                    theme.colorScheme === 'dark'
                      ? theme.colors.yellow[4]
                      : theme.colors.blue[6],
                  marginLeft: 'auto',
                })}
              >
                {color === 'dark' ? (
                  <IconSun size="1.2rem" />
                ) : (
                  <IconMoonStars size="1.2rem" />
                )}
              </ActionIcon>
            </Group>
          </Container>
        </Header>
        <Container my="md">
          <SimpleGrid
            cols={2}
            spacing="md"
            breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
          >
            <Stack>
              <Textarea
                placeholder="Type your prompt here"
                // label="prompts"
                radius="md"
                height={PRIMARY_COL_HEIGHT}
                autosize
                minRows={15}
                maxRows={18}
                onChange={(event) => setText(event.currentTarget.value)}
              />
              {/* User Input */}
              <Input
                placeholder="User"
                value={user}
                onChange={(event) => setUser(event.currentTarget.value)}
              />
              <Select
                data={[
                  { value: 'dev', label: 'Dev' },
                  { value: 'prod', label: 'Prod' },
                ]}
                value={environment}
                onChange={(value, option) => setEnvironment(option)}
              />
              <Select
                data={[
                  { value: 'gpt-3.5-turbo-0125', label: 'GPT-3.5 Turbo 0125' },
                  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
                  {
                    value: 'gpt-3.5-turbo-instruct',
                    label: 'GPT-3.5 Turbo Instruct',
                  },
                  {
                    value: 'gpt-3.5-turbo-16k-0613',
                    label: 'GPT-3.5 Turbo 16k 0613',
                  },
                ]}
                value={model}
                onChange={(value, option) => setModel(option)}
              />

              <Grid>
                <Grid.Col span={4}>
                  <Button
                    leftIcon={<IconClick size="1rem" />}
                    loading={loading}
                    fullWidth
                    onClick={() => promptResponse({ prompt: text })}
                  >
                    Submit
                  </Button>
                </Grid.Col>
              </Grid>
              {/* Output Area */}
            </Stack>
            <Textarea
              value={output}
              placeholder="Output will be shown here"
              readOnly
              height={PRIMARY_COL_HEIGHT}
              minRows={15}
              overflowY="scroll"
            />
          </SimpleGrid>
        </Container>
      </MantineProvider>
    </div>
  );
}

const useStyles = createStyles((theme) => ({
  inner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: rem(56),

    [theme.fn.smallerThan('sm')]: {
      justifyContent: 'flex-start',
    },
  },
  root: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
    boxShadow: theme.shadows.md,
    border: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[1]}`,
  },

  indicator: {
    backgroundImage: theme.fn.gradient({ from: 'pink', to: 'orange' }),
  },

  control: {
    border: '0 !important',
  },

  label: {
    '&, &:hover': {
      '&[data-active]': {
        color: theme.white,
      },
    },
  },
}));

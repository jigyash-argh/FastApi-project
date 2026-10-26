import unittest
from types import SimpleNamespace
from unittest.mock import patch

from app.services import ai_services


class StreamAIResponseTests(unittest.TestCase):
    def setUp(self):
        self.allowed_patcher = patch.object(ai_services, "is_allowed_topic", return_value=True)
        self.messages_patcher = patch.object(
            ai_services, "build_langchain_messages", return_value=["messages"]
        )
        self.allowed_patcher.start()
        self.messages_patcher.start()
        self.addCleanup(self.allowed_patcher.stop)
        self.addCleanup(self.messages_patcher.stop)

    def test_empty_stream_recovers_with_non_streaming_response(self):
        model = SimpleNamespace(
            stream=lambda _messages: iter(
                [
                    SimpleNamespace(
                        content="",
                        additional_kwargs={"reasoning_content": "hidden reasoning"},
                        response_metadata={"finish_reason": "stop"},
                    )
                ]
            ),
            invoke=lambda _messages: SimpleNamespace(content="Recovered answer"),
        )

        with patch.object(ai_services, "get_chat_model", return_value=model):
            result = list(ai_services.stream_ai_response("Suggest dinner"))

        self.assertEqual(result, ["Recovered answer"])

    def test_empty_primary_stream_and_invoke_fall_back_to_next_model(self):
        empty_model = SimpleNamespace(
            stream=lambda _messages: iter([SimpleNamespace(content="")]),
            invoke=lambda _messages: SimpleNamespace(content=""),
        )
        fallback_model = SimpleNamespace(
            stream=lambda _messages: iter(
                [SimpleNamespace(content="Fallback "), SimpleNamespace(content="answer")]
            ),
            invoke=unittest.mock.Mock(),
        )

        with patch.object(
            ai_services,
            "get_chat_model",
            side_effect=[empty_model, fallback_model],
        ):
            result = list(ai_services.stream_ai_response("Suggest dinner"))

        self.assertEqual(result, ["Fallback ", "answer"])
        fallback_model.invoke.assert_not_called()

    def test_stream_error_after_visible_content_is_not_retried(self):
        def broken_stream(_messages):
            yield SimpleNamespace(content="partial")
            raise RuntimeError("stream interrupted")

        model = SimpleNamespace(
            stream=broken_stream,
            invoke=unittest.mock.Mock(),
        )
        get_model = unittest.mock.Mock(return_value=model)

        with patch.object(ai_services, "get_chat_model", get_model):
            response = ai_services.stream_ai_response("Suggest dinner")
            self.assertEqual(next(response), "partial")
            with self.assertRaisesRegex(RuntimeError, "stream interrupted"):
                next(response)

        model.invoke.assert_not_called()
        get_model.assert_called_once()


if __name__ == "__main__":
    unittest.main()
